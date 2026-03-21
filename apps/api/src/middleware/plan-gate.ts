import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth";
import { prisma } from "@marketpilot/database";
import { isUpgradeRequired } from "@marketpilot/billing";
import { AppError } from "./error-handler";
import type { PlanTier } from "@marketpilot/types";

export function requirePlan(minTier: PlanTier) {
  return async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.userId) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    }

    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.userId },
        include: { plan: true },
      });

      const currentTier = (subscription?.plan?.tier ?? "FREE") as PlanTier;

      if (isUpgradeRequired(currentTier, minTier)) {
        return next(
          new AppError(
            403,
            "PLAN_REQUIRED",
            `This feature requires the ${minTier} plan or higher`,
            { currentTier, requiredTier: minTier }
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireLiveEligible(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  // This would check jurisdiction + plan + risk acknowledgement
  // For now, a placeholder that checks plan tier
  requirePlan("ELITE")(req, _res, next);
}
