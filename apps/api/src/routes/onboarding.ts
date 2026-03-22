import { Router } from "express";
import { z } from "zod";
import { prisma } from "@marketpilot/database";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { logger } from "../lib/logger";

export const onboardingRouter = Router();

onboardingRouter.use(requireAuth);

// ── POST /api/onboarding/jurisdiction ────────────────────────────────────────
const jurisdictionSchema = z.object({
  country: z.string().min(1, "Country is required"),
});

onboardingRouter.post("/jurisdiction", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId!;
    const { country } = jurisdictionSchema.parse(req.body);

    const restrictedCountries = [
      "Cuba", "Iran", "North Korea", "Syria", "Russia",
      "Belarus", "Myanmar", "Libya", "Somalia", "Sudan",
      "South Sudan", "Yemen", "Zimbabwe", "Venezuela", "Nicaragua",
    ];
    const status = restrictedCountries.includes(country) ? "RESTRICTED" : "ELIGIBLE";

    // Create a jurisdiction check record (not upsert — multiple checks allowed)
    await prisma.jurisdictionCheck.create({
      data: {
        userId,
        country,
        status,
        ipAddress: req.ip || undefined,
      },
    });

    // Update user profile
    await prisma.userProfile.update({
      where: { userId },
      data: {
        jurisdictionStatus: status,
        country,
        onboardingStep: 3,
      },
    });

    logger.info(`Jurisdiction check: user=${userId} country=${country} status=${status}`);

    res.json({
      success: true,
      data: { country, status },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/onboarding/risk-ack ────────────────────────────────────────────
onboardingRouter.post("/risk-ack", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId!;

    // Create risk acknowledgement record
    await prisma.riskAcknowledgement.create({
      data: {
        userId,
        version: "1.0",
        ipAddress: req.ip || undefined,
      },
    });

    // Advance onboarding step
    await prisma.userProfile.update({
      where: { userId },
      data: { onboardingStep: 4 },
    });

    logger.info(`Risk acknowledgement: user=${userId}`);

    res.json({
      success: true,
      data: { acknowledged: true },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/onboarding/complete ────────────────────────────────────────────
onboardingRouter.post("/complete", async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId!;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError(404, "PROFILE_NOT_FOUND", "User profile not found");
    }

    // Allow both ELIGIBLE and RESTRICTED users to complete onboarding.
    // RESTRICTED users are limited to paper trading only — live trading
    // is blocked at the bot creation / order execution layer.
    if (profile.jurisdictionStatus === "UNCHECKED") {
      throw new AppError(400, "JURISDICTION_REQUIRED", "Jurisdiction check must be completed first");
    }

    await prisma.userProfile.update({
      where: { userId },
      data: {
        onboardingComplete: true,
        onboardingStep: 5,
      },
    });

    logger.info(`Onboarding complete: user=${userId} jurisdiction=${profile.jurisdictionStatus}`);

    res.json({
      success: true,
      data: { onboardingComplete: true },
    });
  } catch (err) {
    next(err);
  }
});
