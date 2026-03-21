import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { prisma } from "@marketpilot/database";
import { requireAuth, type AuthenticatedRequest } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { PLANS } from "@marketpilot/billing";
import { logger } from "../lib/logger";

export const billingRouter = Router();

// ── Stripe Client ───────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new AppError("Stripe is not configured. Set STRIPE_SECRET_KEY.", 503);
  }
  return new Stripe(key, { apiVersion: "2024-12-18.acacia" });
}

// ── Price ID Mapping ────────────────────────────────────────────────────────

const PRICE_IDS: Record<string, string | undefined> = {
  PRO_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  PRO_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  ELITE_monthly: process.env.STRIPE_PRICE_ELITE_MONTHLY,
  ELITE_yearly: process.env.STRIPE_PRICE_ELITE_YEARLY,
};

function getPriceId(tier: "PRO" | "ELITE", interval: "monthly" | "yearly"): string {
  const key = `${tier}_${interval}`;
  const priceId = PRICE_IDS[key];
  if (!priceId) {
    throw new AppError(
      `Stripe price ID not configured for ${tier} ${interval}. Set STRIPE_PRICE_${tier}_${interval.toUpperCase()}.`,
      503,
    );
  }
  return priceId;
}

// ── Helper: Get or Create Stripe Customer ───────────────────────────────────

async function getOrCreateStripeCustomer(
  stripe: Stripe,
  userId: string,
): Promise<{ stripeCustomerId: string; billingCustomerId: string }> {
  const existing = await prisma.billingCustomer.findUnique({
    where: { userId },
  });

  if (existing) {
    return {
      stripeCustomerId: existing.stripeCustomerId,
      billingCustomerId: existing.id,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId },
  });

  const billingCustomer = await prisma.billingCustomer.create({
    data: {
      userId,
      stripeCustomerId: customer.id,
    },
  });

  return {
    stripeCustomerId: customer.id,
    billingCustomerId: billingCustomer.id,
  };
}

// ── Helper: Resolve plan tier from Stripe price ID ──────────────────────────

function resolvePlanTierFromPriceId(priceId: string): "PRO" | "ELITE" | null {
  for (const [key, val] of Object.entries(PRICE_IDS)) {
    if (val === priceId) {
      return key.split("_")[0] as "PRO" | "ELITE";
    }
  }
  return null;
}

// ── GET /subscription ───────────────────────────────────────────────────────

billingRouter.get(
  "/subscription",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: req.userId! },
        include: { plan: true },
      });

      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },
);

// ── GET /plans ──────────────────────────────────────────────────────────────

billingRouter.get("/plans", async (_req, res) => {
  res.json({ success: true, data: Object.values(PLANS) });
});

// ── POST /checkout ──────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  planTier: z.enum(["PRO", "ELITE"]),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
});

billingRouter.post(
  "/checkout",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const stripe = getStripe();
      const { planTier, interval } = checkoutSchema.parse(req.body);
      const priceId = getPriceId(planTier, interval);

      const { stripeCustomerId } = await getOrCreateStripeCustomer(
        stripe,
        req.userId!,
      );

      const appUrl = process.env.APP_URL || "http://localhost:3000";

      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${appUrl}/billing?canceled=true`,
        subscription_data: {
          metadata: {
            userId: req.userId!,
            planTier,
            interval,
          },
        },
        metadata: {
          userId: req.userId!,
          planTier,
          interval,
        },
      });

      logger.info(
        `Checkout session created: user=${req.userId} plan=${planTier} interval=${interval} session=${session.id}`,
      );

      res.json({
        success: true,
        data: {
          checkoutUrl: session.url,
          sessionId: session.id,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── POST /webhook ───────────────────────────────────────────────────────────
// NOTE: This route expects a raw body (Buffer), not JSON-parsed.
// The raw body middleware is configured in index.ts for this path.

billingRouter.post(
  "/webhook",
  async (req: Request, res: Response, next: NextFunction) => {
    let stripe: Stripe;
    try {
      stripe = getStripe();
    } catch (err) {
      logger.error("Stripe not configured; cannot process webhook");
      res.status(503).json({ error: "Stripe not configured" });
      return;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error("STRIPE_WEBHOOK_SECRET not set; cannot verify webhook");
      res.status(503).json({ error: "Webhook secret not configured" });
      return;
    }

    const sig = req.headers["stripe-signature"] as string | undefined;
    if (!sig) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
      return;
    }

    logger.info(`Stripe webhook received: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(stripe, event);
          break;

        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event);
          break;

        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event);
          break;

        case "invoice.payment_failed":
          await handlePaymentFailed(event);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }

      // Store every event in BillingEvent table
      await storeWebhookEvent(event);

      res.json({ received: true });
    } catch (error) {
      logger.error(`Error processing webhook ${event.type}: ${error}`);
      next(error);
    }
  },
);

// ── Webhook Handlers ────────────────────────────────────────────────────────

async function handleCheckoutCompleted(stripe: Stripe, event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  const userId = session.metadata?.userId;
  if (!userId) {
    logger.error("checkout.session.completed missing userId in metadata");
    return;
  }

  const planTier = session.metadata?.planTier as "PRO" | "ELITE" | undefined;
  if (!planTier) {
    logger.error("checkout.session.completed missing planTier in metadata");
    return;
  }

  // Retrieve subscription details from Stripe
  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!stripeSubscriptionId) {
    logger.error("checkout.session.completed missing subscription ID");
    return;
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId,
  );

  // Find the plan in our DB
  const plan = await prisma.plan.findUnique({
    where: { tier: planTier },
  });

  if (!plan) {
    logger.error(`Plan not found for tier: ${planTier}`);
    return;
  }

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId: plan.id,
      status: "ACTIVE",
      stripeSubscriptionId,
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000,
      ),
      currentPeriodEnd: new Date(
        stripeSubscription.current_period_end * 1000,
      ),
    },
    update: {
      planId: plan.id,
      status: "ACTIVE",
      stripeSubscriptionId,
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000,
      ),
      currentPeriodEnd: new Date(
        stripeSubscription.current_period_end * 1000,
      ),
      cancelAtPeriodEnd: false,
    },
  });

  logger.info(
    `Subscription activated: user=${userId} plan=${planTier} stripeSubId=${stripeSubscriptionId}`,
  );
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = subscription.id;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!dbSubscription) {
    logger.warn(
      `Subscription not found for stripeSubscriptionId: ${stripeSubscriptionId}`,
    );
    return;
  }

  // Map Stripe status to our SubscriptionStatus enum
  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    trialing: "TRIALING",
    past_due: "PAST_DUE",
    canceled: "CANCELED",
    unpaid: "UNPAID",
  };

  const newStatus = statusMap[subscription.status] || "ACTIVE";

  // Check if the price changed (plan upgrade/downgrade)
  const currentPriceId = subscription.items.data[0]?.price?.id;
  let planTier: "PRO" | "ELITE" | null = null;
  if (currentPriceId) {
    planTier = resolvePlanTierFromPriceId(currentPriceId);
  }

  const updateData: Record<string, any> = {
    status: newStatus,
    currentPeriodStart: new Date(
      subscription.current_period_start * 1000,
    ),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (planTier) {
    const plan = await prisma.plan.findUnique({ where: { tier: planTier } });
    if (plan) {
      updateData.planId = plan.id;
    }
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: updateData,
  });

  logger.info(
    `Subscription updated: stripeSubId=${stripeSubscriptionId} status=${newStatus}`,
  );
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = subscription.id;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!dbSubscription) {
    logger.warn(
      `Subscription not found for deletion: stripeSubId=${stripeSubscriptionId}`,
    );
    return;
  }

  // Revert user to FREE plan
  const freePlan = await prisma.plan.findUnique({
    where: { tier: "FREE" },
  });

  if (!freePlan) {
    logger.error("FREE plan not found in database");
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      planId: freePlan.id,
      status: "CANCELED",
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
    },
  });

  logger.info(
    `Subscription deleted — reverted to FREE: user=${dbSubscription.userId} stripeSubId=${stripeSubscriptionId}`,
  );
}

async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeSubscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!stripeSubscriptionId) {
    logger.warn("invoice.payment_failed missing subscription ID");
    return;
  }

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
  });

  if (!dbSubscription) {
    logger.warn(
      `Subscription not found for failed payment: stripeSubId=${stripeSubscriptionId}`,
    );
    return;
  }

  // Set to PAST_DUE
  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: { status: "PAST_DUE" },
  });

  // Create a billing alert for the user
  await prisma.alert.create({
    data: {
      userId: dbSubscription.userId,
      type: "BILLING",
      severity: "WARNING",
      title: "Payment Failed",
      message:
        "Your most recent payment failed. Please update your payment method to avoid service interruption.",
      metadata: {
        stripeInvoiceId: invoice.id,
        amountDue: invoice.amount_due,
        currency: invoice.currency,
      },
    },
  });

  logger.info(
    `Payment failed — subscription set to PAST_DUE: user=${dbSubscription.userId} stripeSubId=${stripeSubscriptionId}`,
  );
}

// ── Store Webhook Event ─────────────────────────────────────────────────────

async function storeWebhookEvent(event: Stripe.Event) {
  // Find billing customer by Stripe customer ID from the event
  const eventObj = event.data.object as any;
  const stripeCustomerId =
    eventObj.customer ??
    eventObj.customer_id ??
    null;

  if (!stripeCustomerId || typeof stripeCustomerId !== "string") {
    logger.warn(
      `Cannot store webhook event ${event.id}: no customer ID in event data`,
    );
    return;
  }

  const billingCustomer = await prisma.billingCustomer.findUnique({
    where: { stripeCustomerId },
  });

  if (!billingCustomer) {
    logger.warn(
      `Cannot store webhook event ${event.id}: billing customer not found for ${stripeCustomerId}`,
    );
    return;
  }

  await prisma.billingEvent.create({
    data: {
      billingCustomerId: billingCustomer.id,
      stripeEventId: event.id,
      type: event.type,
      data: event.data.object as any,
    },
  });
}

// ── POST /portal ────────────────────────────────────────────────────────────

billingRouter.post(
  "/portal",
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const stripe = getStripe();

      const billingCustomer = await prisma.billingCustomer.findUnique({
        where: { userId: req.userId! },
      });

      if (!billingCustomer) {
        throw new AppError(
          "No billing account found. Please subscribe to a plan first.",
          404,
        );
      }

      const appUrl = process.env.APP_URL || "http://localhost:3000";

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: billingCustomer.stripeCustomerId,
        return_url: `${appUrl}/billing`,
      });

      logger.info(
        `Billing portal session created: user=${req.userId}`,
      );

      res.json({
        success: true,
        data: {
          portalUrl: portalSession.url,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
