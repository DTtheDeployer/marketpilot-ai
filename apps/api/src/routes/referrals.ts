import { Router } from "express";
import crypto from "crypto";
import { prisma } from "@marketpilot/database";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { logger } from "../lib/logger";

export const referralsRouter = Router();

// ── Generate Referral Code ──────────────────────────────────────────────────
referralsRouter.post("/generate", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    if (user.referralCode) {
      return res.json({
        success: true,
        data: { referralCode: user.referralCode },
      });
    }

    const code = `MP-${crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 6)}`;

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { referralCode: code },
    });

    logger.info(`Referral code generated for user ${req.userId}: ${code}`);

    res.status(201).json({
      success: true,
      data: { referralCode: updated.referralCode },
    });
  } catch (error) {
    next(error);
  }
});

// ── Get Referral Stats & List ───────────────────────────────────────────────
referralsRouter.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: req.userId },
      orderBy: { createdAt: "desc" },
    });

    const totalReferred = referrals.length;
    const converted = referrals.filter((r) => r.status === "converted").length;
    const creditsEarned = referrals
      .filter((r) => r.creditAmount != null)
      .reduce((sum, r) => sum + (r.creditAmount || 0), 0);

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        stats: {
          totalReferred,
          converted,
          creditsEarned,
        },
        referrals: referrals.map((r) => ({
          id: r.id,
          referredId: r.referredId,
          status: r.status,
          creditAmount: r.creditAmount,
          createdAt: r.createdAt,
          convertedAt: r.convertedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Validate Referral Code ──────────────────────────────────────────────────
referralsRouter.get("/validate/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const user = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, name: true, referralCode: true },
    });

    if (!user) {
      throw new AppError(404, "INVALID_CODE", "Referral code not found");
    }

    res.json({
      success: true,
      data: {
        valid: true,
        code: user.referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
});
