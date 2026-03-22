import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./routes/auth";
import { strategiesRouter } from "./routes/strategies";
import { botsRouter } from "./routes/bots";
import { backtestsRouter } from "./routes/backtests";
import { ordersRouter } from "./routes/orders";
import { alertsRouter } from "./routes/alerts";
import { billingRouter } from "./routes/billing";
import { adminRouter } from "./routes/admin";
import { onboardingRouter } from "./routes/onboarding";
import { marketsRouter } from "./routes/markets";
import { referralsRouter } from "./routes/referrals";
import { healthRouter } from "./routes/health";
import { errorHandler } from "./middleware/error-handler";
import { logger } from "./lib/logger";
import { initializeBotScheduler, shutdownBotScheduler } from "./services/bot-scheduler";
import { startBotWorker, stopBotWorker } from "./services/bot-worker";

const app = express();
const PORT = process.env.API_PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.APP_URL || "http://localhost:3000", credentials: true }));

// Stripe webhooks require the raw body for signature verification.
// This must be registered BEFORE the general express.json() middleware.
app.use(
  "/api/billing/webhook",
  express.raw({ type: "application/json" }),
);

app.use(express.json({ limit: "10mb" }));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/strategies", strategiesRouter);
app.use("/api/bots", botsRouter);
app.use("/api/backtests", backtestsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/billing", billingRouter);
app.use("/api/markets", marketsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/onboarding", onboardingRouter);
app.use("/api/referrals", referralsRouter);

// ── Error handling ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`MarketPilot API running on port ${PORT}`);

  // Start the bot execution worker and scheduler after the server is listening
  startBotWorker();
  initializeBotScheduler().catch((err) => {
    logger.error("Failed to initialize bot scheduler on startup", {
      error: err instanceof Error ? err.message : String(err),
    });
  });
});

// ── Graceful shutdown ───────────────────────────────────────────────────────
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  await stopBotWorker();
  await shutdownBotScheduler();
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
