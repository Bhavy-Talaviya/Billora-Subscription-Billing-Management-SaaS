import prisma from "@/lib/prisma";
import {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  ChangePlanInput,
} from "@/lib/validations/subscription";
import { Prisma, SubscriptionStatus, BillingInterval } from "@prisma/client";
import { addMonths, addYears, addDays } from "date-fns";

export interface GetSubscriptionsParams {
  search?: string;
  status?: string;
  customerId?: string;
  productId?: string;
  interval?: string;
  page?: number;
  limit?: number;
  upcomingDays?: number;
}

/**
 * Calculates next billing date and period end based on billing interval.
 */
export function calculateNextBilling(
  fromDate: Date,
  interval: BillingInterval
): Date {
  switch (interval) {
    case "MONTHLY":
      return addMonths(fromDate, 1);
    case "YEARLY":
      return addYears(fromDate, 1);
    case "ONE_TIME":
      // For one-time purchases, there is no recurring renewal period
      return addYears(fromDate, 100);
    default:
      return addMonths(fromDate, 1);
  }
}

/**
 * List subscriptions with optional filters, search, pagination, and renewal counts.
 */
export async function getSubscriptions(params: GetSubscriptionsParams = {}) {
  const {
    search = "",
    status,
    customerId,
    productId,
    interval,
    page = 1,
    limit = 20,
    upcomingDays,
  } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.SubscriptionWhereInput = {};

  if (status && status !== "all") {
    where.status = status as SubscriptionStatus;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  const priceWhere: Prisma.PriceWhereInput = {};
  if (productId) {
    priceWhere.productId = productId;
  }
  if (interval && interval !== "all") {
    priceWhere.billingInterval = interval as BillingInterval;
  }
  if (Object.keys(priceWhere).length > 0) {
    where.price = priceWhere;
  }

  if (upcomingDays && upcomingDays > 0) {
    const now = new Date();
    const futureLimit = addDays(now, upcomingDays);
    where.status = "ACTIVE";
    where.nextBillingDate = {
      gte: now,
      lte: futureLimit,
    };
  }

  if (search.trim()) {
    const s = search.trim();
    where.OR = [
      { customer: { name: { contains: s, mode: "insensitive" } } },
      { customer: { email: { contains: s, mode: "insensitive" } } },
      { customer: { company: { contains: s, mode: "insensitive" } } },
      { price: { product: { name: { contains: s, mode: "insensitive" } } } },
    ];
  }

  const [total, subscriptions] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        price: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    }),
  ]);

  return {
    subscriptions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get detailed subscription record including invoices and pricing details.
 */
export async function getSubscriptionById(id: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      customer: true,
      price: {
        include: {
          product: true,
        },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
        include: {
          items: true,
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  return subscription;
}

/**
 * Create a new subscription and generate its initial invoice simulation.
 */
export async function createSubscription(data: CreateSubscriptionInput) {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
  });
  if (!customer) throw new Error("Customer not found.");

  const price = await prisma.price.findUnique({
    where: { id: data.priceId },
    include: { product: true },
  });
  if (!price) throw new Error("Pricing plan not found.");
  if (!price.active) {
    throw new Error("Cannot create subscription with an inactive pricing plan.");
  }

  const startDate = data.startDate ? new Date(data.startDate) : new Date();
  const firstBilling = data.firstBillingDate
    ? new Date(data.firstBillingDate)
    : startDate;

  // Next billing date calculation
  const nextBillingDate =
    price.billingInterval === "ONE_TIME"
      ? null
      : calculateNextBilling(firstBilling, price.billingInterval);

  const currentPeriodStart = startDate;
  const currentPeriodEnd =
    price.billingInterval === "ONE_TIME"
      ? addYears(startDate, 100)
      : calculateNextBilling(startDate, price.billingInterval);

  // Execute in transaction to safely create subscription and initial draft/pending invoice
  return await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.create({
      data: {
        customerId: data.customerId,
        priceId: data.priceId,
        status: "ACTIVE",
        startDate,
        currentPeriodStart,
        currentPeriodEnd,
        nextBillingDate,
      },
      include: {
        customer: true,
        price: {
          include: { product: true },
        },
      },
    });

    // Generate initial invoice for subscription ledger
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-01`;
    const subtotal = price.amount;
    const total = subtotal; // No initial discount/tax in base

    await tx.invoice.create({
      data: {
        customerId: data.customerId,
        subscriptionId: subscription.id,
        invoiceNumber,
        issueDate: firstBilling,
        dueDate: addDays(firstBilling, 14),
        subtotal,
        discount: 0,
        tax: 0,
        total,
        status: "PAID",
        notes: `Initial subscription charge for ${price.product.name} (${price.billingInterval}).`,
        items: {
          create: {
            description: `${price.product.name} - ${price.billingInterval} Plan`,
            quantity: 1,
            unitPrice: price.amount,
            amount: price.amount,
          },
        },
        payments: {
          create: {
            customerId: data.customerId,
            amount: total,
            paymentMethod: "CREDIT_CARD",
            status: "SUCCEEDED",
            transactionReference: `TX-${Date.now().toString().slice(-8)}`,
            paidAt: firstBilling,
          },
        },
      },
    });

    return subscription;
  });
}

/**
 * Pause subscription:
 * Sets status to PAUSED and records pausedAt timestamp.
 * Paused subscriptions are excluded from renewal cycles.
 */
export async function pauseSubscription(id: string) {
  const existing = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!existing) throw new Error("Subscription not found.");

  if (existing.status !== "ACTIVE") {
    throw new Error(
      `Cannot pause subscription in '${existing.status}' status. Only ACTIVE subscriptions can be paused.`
    );
  }

  return await prisma.subscription.update({
    where: { id },
    data: {
      status: "PAUSED",
      pausedAt: new Date(),
    },
    include: {
      customer: true,
      price: { include: { product: true } },
    },
  });
}

/**
 * Resume subscription:
 * Resumes a PAUSED subscription back to ACTIVE.
 * Recomputes the next billing date based on remaining period.
 */
export async function resumeSubscription(id: string) {
  const existing = await prisma.subscription.findUnique({
    where: { id },
    include: { price: true },
  });

  if (!existing) throw new Error("Subscription not found.");

  if (existing.status !== "PAUSED") {
    throw new Error(
      `Cannot resume subscription in '${existing.status}' status. Only PAUSED subscriptions can be resumed.`
    );
  }

  const now = new Date();
  const nextBillingDate =
    existing.price.billingInterval === "ONE_TIME"
      ? null
      : calculateNextBilling(now, existing.price.billingInterval);

  return await prisma.subscription.update({
    where: { id },
    data: {
      status: "ACTIVE",
      pausedAt: null,
      nextBillingDate,
      currentPeriodEnd: nextBillingDate || existing.currentPeriodEnd,
    },
    include: {
      customer: true,
      price: { include: { product: true } },
    },
  });
}

/**
 * Cancel subscription:
 * Sets status to CANCELLED and records cancelledAt timestamp.
 * Cancelled subscriptions can never be renewed.
 */
export async function cancelSubscription(id: string) {
  const existing = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!existing) throw new Error("Subscription not found.");

  if (existing.status === "CANCELLED") {
    throw new Error("Subscription is already cancelled.");
  }

  return await prisma.subscription.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      nextBillingDate: null,
    },
    include: {
      customer: true,
      price: { include: { product: true } },
    },
  });
}

/**
 * Upgrade or Downgrade subscription (Plan Change):
 * Business rule:
 * - Updates the selected price to the new plan.
 * - Records activity timestamp.
 * - Does NOT alter historical invoices.
 * - Recalculates nextBillingDate and currentPeriodEnd.
 */
export async function changeSubscriptionPlan(
  id: string,
  data: ChangePlanInput
) {
  const existing = await prisma.subscription.findUnique({
    where: { id },
    include: { price: { include: { product: true } } },
  });

  if (!existing) throw new Error("Subscription not found.");

  if (existing.status === "CANCELLED") {
    throw new Error("Cannot change plan of a CANCELLED subscription.");
  }

  const newPrice = await prisma.price.findUnique({
    where: { id: data.newPriceId },
    include: { product: true },
  });

  if (!newPrice) throw new Error("Selected new pricing plan not found.");
  if (!newPrice.active) {
    throw new Error("Cannot switch to an inactive pricing plan.");
  }

  if (existing.priceId === data.newPriceId) {
    throw new Error("The subscription is already on this pricing plan.");
  }

  const now = new Date();
  const nextBillingDate =
    newPrice.billingInterval === "ONE_TIME"
      ? null
      : calculateNextBilling(now, newPrice.billingInterval);

  const isUpgrade = Number(newPrice.amount) > Number(existing.price.amount);
  const actionType = isUpgrade ? "UPGRADE" : "DOWNGRADE";

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.subscription.update({
      where: { id },
      data: {
        priceId: data.newPriceId,
        nextBillingDate,
        currentPeriodStart: now,
        currentPeriodEnd: nextBillingDate || existing.currentPeriodEnd,
      },
      include: {
        customer: true,
        price: { include: { product: true } },
      },
    });

    // Create a new invoice record reflecting the plan change if effective immediately
    if (data.effectivePolicy === "IMMEDIATE") {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-CHG`;
      await tx.invoice.create({
        data: {
          customerId: existing.customerId,
          subscriptionId: existing.id,
          invoiceNumber,
          issueDate: now,
          dueDate: addDays(now, 14),
          subtotal: newPrice.amount,
          discount: 0,
          tax: 0,
          total: newPrice.amount,
          status: "PAID",
          notes: `Plan change (${actionType}) from ${existing.price.product.name} ($${existing.price.amount}) to ${newPrice.product.name} ($${newPrice.amount}). Effective immediately.`,
          items: {
            create: {
              description: `${actionType}: ${newPrice.product.name} - ${newPrice.billingInterval}`,
              quantity: 1,
              unitPrice: newPrice.amount,
              amount: newPrice.amount,
            },
          },
          payments: {
            create: {
              customerId: existing.customerId,
              amount: newPrice.amount,
              paymentMethod: "CREDIT_CARD",
              status: "SUCCEEDED",
              transactionReference: `TX-${Date.now().toString().slice(-8)}`,
              paidAt: now,
            },
          },
        },
      });
    }

    return updated;
  });
}

/**
 * Renew subscription (Simulated Renewal):
 * Business rule:
 * - ACTIVE subscriptions can be renewed.
 * - Generates new renewal invoice.
 * - Advances nextBillingDate.
 */
export async function renewSubscription(id: string) {
  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: {
      price: { include: { product: true } },
      customer: true,
    },
  });

  if (!sub) throw new Error("Subscription not found.");
  if (sub.status !== "ACTIVE") {
    throw new Error(`Cannot renew subscription in '${sub.status}' status.`);
  }

  if (sub.price.billingInterval === "ONE_TIME") {
    throw new Error("One-time purchases do not require renewal.");
  }

  const now = new Date();
  const baseDate = sub.nextBillingDate || now;
  const newNextBilling = calculateNextBilling(baseDate, sub.price.billingInterval);
  const newPeriodEnd = newNextBilling;

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.subscription.update({
      where: { id },
      data: {
        nextBillingDate: newNextBilling,
        currentPeriodStart: baseDate,
        currentPeriodEnd: newPeriodEnd,
      },
      include: {
        customer: true,
        price: { include: { product: true } },
      },
    });

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-REN`;
    await tx.invoice.create({
      data: {
        customerId: sub.customerId,
        subscriptionId: sub.id,
        invoiceNumber,
        issueDate: now,
        dueDate: addDays(now, 14),
        subtotal: sub.price.amount,
        discount: 0,
        tax: 0,
        total: sub.price.amount,
        status: "PAID",
        notes: `Simulated subscription renewal for ${sub.price.product.name} (${sub.price.billingInterval}).`,
        items: {
          create: {
            description: `Renewal: ${sub.price.product.name} (${sub.price.billingInterval})`,
            quantity: 1,
            unitPrice: sub.price.amount,
            amount: sub.price.amount,
          },
        },
        payments: {
          create: {
            customerId: sub.customerId,
            amount: sub.price.amount,
            paymentMethod: "CREDIT_CARD",
            status: "SUCCEEDED",
            transactionReference: `TX-${Date.now().toString().slice(-8)}`,
            paidAt: now,
          },
        },
      },
    });

    return updated;
  });
}
