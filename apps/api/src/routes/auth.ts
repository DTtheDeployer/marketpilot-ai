import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@marketpilot/database";
import { generateToken, requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { logger } from "../lib/logger";

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Sign Up ──────────────────────────────────────────────────────────────────
authRouter.post("/signup", async (req, res, next) => {
  try {
    const { email, password, name, referralCode } = signupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists");
    }

    // Validate referral code if provided
    let referrerId: string | null = null;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true },
      });
      if (!referrer) {
        throw new AppError(400, "INVALID_REFERRAL", "Invalid referral code");
      }
      referrerId = referrer.id;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Auto-generate a referral code for the new user
    const newUserReferralCode = `MP-${crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 6)}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || email.split("@")[0],
        referralCode: newUserReferralCode,
        referredBy: referralCode || undefined,
        profile: {
          create: {
            tradingMode: "PAPER",
            jurisdictionStatus: "UNCHECKED",
            riskPreset: "CONSERVATIVE",
          },
        },
      },
      include: { profile: true },
    });

    // Create referral record if referred by someone
    if (referrerId) {
      await prisma.referral.create({
        data: {
          referrerId,
          referredId: user.id,
          status: "pending",
        },
      });
    }

    // Create free subscription
    const freePlan = await prisma.plan.findUnique({ where: { tier: "FREE" } });
    if (freePlan) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freePlan.id,
          status: "ACTIVE",
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_SIGNUP",
        resource: "user",
        resourceId: user.id,
        ipAddress: req.ip,
        details: referralCode ? { referralCode } : undefined,
      },
    });

    const token = generateToken(user.id, user.role);

    logger.info(`New user signup: ${email}${referralCode ? ` (referred by ${referralCode})` : ""}`);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Login ────────────────────────────────────────────────────────────────────
authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true, subscription: { include: { plan: true } } },
    });

    if (!user || !user.passwordHash) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const token = generateToken(user.id, user.role);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        resource: "user",
        resourceId: user.id,
        ipAddress: req.ip,
      },
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
          subscription: user.subscription
            ? {
                planTier: user.subscription.plan.tier,
                status: user.subscription.status,
              }
            : null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Get Current User ─────────────────────────────────────────────────────────
authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        profile: true,
        subscription: { include: { plan: true } },
      },
    });

    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found");
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
        subscription: user.subscription
          ? {
              planTier: user.subscription.plan.tier,
              status: user.subscription.status,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── Update Profile ───────────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
  riskPreset: z.enum(["CONSERVATIVE", "BALANCED", "ADVANCED"]).optional(),
});

authRouter.patch("/profile", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    if (data.name) {
      await prisma.user.update({
        where: { id: req.userId },
        data: { name: data.name },
      });
    }

    const profile = await prisma.userProfile.update({
      where: { userId: req.userId },
      data: {
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.riskPreset && { riskPreset: data.riskPreset }),
      },
    });

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
});
