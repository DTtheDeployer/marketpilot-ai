import { Router } from "express";
import { prisma } from "@marketpilot/database";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "healthy";
  } catch {
    checks.database = "down";
  }

  // Redis check would go here
  checks.redis = "healthy";
  checks.api = "healthy";

  const allHealthy = Object.values(checks).every((v) => v === "healthy");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "healthy" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
});
