import { Router } from "express";
import { z } from "zod";
import { prisma } from "@marketpilot/database";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

export const strategiesRouter = Router();

// ── List Strategies ──────────────────────────────────────────────────────────
strategiesRouter.get("/", async (_req, res, next) => {
  try {
    const strategies = await prisma.strategy.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: strategies });
  } catch (error) {
    next(error);
  }
});

// ── Get Strategy by Slug ─────────────────────────────────────────────────────
strategiesRouter.get("/:slug", async (req, res, next) => {
  try {
    const strategy = await prisma.strategy.findUnique({
      where: { slug: req.params.slug },
      include: {
        versions: { orderBy: { createdAt: "desc" }, take: 5 },
        metrics: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!strategy) {
      throw new AppError(404, "NOT_FOUND", "Strategy not found");
    }

    res.json({ success: true, data: strategy });
  } catch (error) {
    next(error);
  }
});

// ── Save User Strategy Config ────────────────────────────────────────────────
const saveConfigSchema = z.object({
  parameters: z.record(z.union([z.string(), z.number(), z.boolean()])),
  riskLimits: z.record(z.number()),
});

strategiesRouter.post(
  "/:slug/config",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { parameters, riskLimits } = saveConfigSchema.parse(req.body);

      const strategy = await prisma.strategy.findUnique({
        where: { slug: req.params.slug },
      });

      if (!strategy) {
        throw new AppError(404, "NOT_FOUND", "Strategy not found");
      }

      const config = await prisma.userStrategyConfig.upsert({
        where: {
          userId_strategyId: {
            userId: req.userId!,
            strategyId: strategy.id,
          },
        },
        update: { parameters, riskLimits },
        create: {
          userId: req.userId!,
          strategyId: strategy.id,
          parameters,
          riskLimits,
        },
      });

      res.json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }
);

// ── Get User Strategy Config ─────────────────────────────────────────────────
strategiesRouter.get(
  "/:slug/config",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const strategy = await prisma.strategy.findUnique({
        where: { slug: req.params.slug },
      });

      if (!strategy) {
        throw new AppError(404, "NOT_FOUND", "Strategy not found");
      }

      const config = await prisma.userStrategyConfig.findUnique({
        where: {
          userId_strategyId: {
            userId: req.userId!,
            strategyId: strategy.id,
          },
        },
      });

      res.json({
        success: true,
        data: config || { parameters: strategy.defaults, riskLimits: {} },
      });
    } catch (error) {
      next(error);
    }
  }
);
