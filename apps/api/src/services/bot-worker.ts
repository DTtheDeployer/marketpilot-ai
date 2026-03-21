import { Worker, type Job } from "bullmq";
import { QUEUE_NAME, getRedisConnection, executeBotCycle } from "./bot-scheduler";
import { logger } from "../lib/logger";

// ── Worker ──────────────────────────────────────────────────────────────────

let worker: Worker | null = null;

interface BotExecutionPayload {
  botId: string;
}

/**
 * Starts the BullMQ worker that processes bot execution jobs.
 * Should be called once at app startup.
 */
export function startBotWorker(): void {
  if (worker) {
    logger.warn("Bot worker is already running");
    return;
  }

  worker = new Worker<BotExecutionPayload>(
    QUEUE_NAME,
    async (job: Job<BotExecutionPayload>) => {
      const { botId } = job.data;

      if (!botId) {
        logger.error("Bot execution job missing botId", { jobId: job.id });
        return;
      }

      logger.debug(`Processing bot execution job for bot ${botId}`, {
        jobId: job.id,
        attempt: job.attemptsMade + 1,
      });

      await executeBotCycle(botId);
    },
    {
      connection: getRedisConnection(),
      concurrency: 10,
      limiter: {
        max: 50,
        duration: 1000,
      },
    },
  );

  worker.on("completed", (job) => {
    logger.debug(`Bot execution job completed`, { jobId: job.id, botId: job.data.botId });
  });

  worker.on("failed", (job, err) => {
    logger.error(`Bot execution job failed`, {
      jobId: job?.id,
      botId: job?.data?.botId,
      error: err.message,
      stack: err.stack,
    });
  });

  worker.on("error", (err) => {
    logger.error("Bot worker error", { error: err.message });
  });

  worker.on("stalled", (jobId) => {
    logger.warn(`Bot execution job stalled`, { jobId });
  });

  logger.info("Bot execution worker started");
}

/**
 * Gracefully shuts down the worker, waiting for in-progress jobs to complete.
 */
export async function stopBotWorker(): Promise<void> {
  if (!worker) return;

  logger.info("Stopping bot execution worker...");
  await worker.close();
  worker = null;
  logger.info("Bot execution worker stopped");
}
