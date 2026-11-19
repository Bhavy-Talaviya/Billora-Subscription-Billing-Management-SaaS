import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import {
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  format,
  eachMonthOfInterval,
  isBefore,
  addDays,
} from "date-fns";

export type DateRangeFilter = "7d" | "30d" | "3m" | "6m" | "12m";

export function getStartDateFromRange(range: DateRangeFilter = "30d"): Date {
  const now = new Date();
  switch (range) {
    case "7d":
      return subDays(now, 7);
    case "30d":
      return subDays(now, 30);
    case "3m":
      return subMonths(now, 3);
    case "6m":
      return subMonths(now, 6);
    case "12m":
      return subMonths(now, 12);
    default:
      return subDays(now, 30);
  }
}

/**
 * KPI Calculations using live PostgreSQL / Prisma records:
 * 1. Total Customers: count of Customer records.
 * 2. Total Active Subscriptions: count of Subscriptions where status == 'ACTIVE'.
 * 3. MRR (Monthly Recurring Revenue):
 *    - For each ACTIVE subscription:
 *      - If price.billingInterval == 'MONTHLY', add amount.
 *      - If price.billingInterval == 'YEARLY', add amount / 12.
 *      - If ONE_TIME, excluded.
 * 4. ARR (Annual Recurring Revenue): MRR * 12.
 * 5. Total Payments Received: sum of SUCCEEDED Payment records.
 * 6. Churn Rate:
 *    - Cancelled subscriptions in period / (Active subscriptions at start + new active).
 * 7. Upcoming Renewals: count of ACTIVE subscriptions with nextBillingDate within the next 30 days.
 * 8. Pending Invoices: count of invoices with status != 'PAID'.
 */
export async function getDashboardStats(range: DateRangeFilter = "30d") {
  const startDate = getStartDateFromRange(range);
  const now = new Date();
  const next30Days = addDays(now, 30);

  const [
    totalCustomers,
    activeSubscriptions,
    allSubscriptions,
    succeededPayments,
    pendingInvoicesCount,
    upcomingRenewalsCount,
    recentCancelledCount,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { price: true },
    }),
    prisma.subscription.findMany({
      select: { id: true, status: true, createdAt: true, cancelledAt: true },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCEEDED" },
    }),
    prisma.invoice.count({
      where: { status: { in: ["PENDING", "OVERDUE", "DRAFT"] } },
    }),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
        nextBillingDate: {
          gte: now,
          lte: next30Days,
        },
      },
    }),
    prisma.subscription.count({
      where: {
        status: "CANCELLED",
        cancelledAt: { gte: startDate },
      },
    }),
  ]);

  // Compute MRR
  let mrr = new Decimal(0);
  for (const sub of activeSubscriptions) {
    const amount = sub.price.amount;
    if (sub.price.billingInterval === "MONTHLY") {
      mrr = mrr.plus(amount);
    } else if (sub.price.billingInterval === "YEARLY") {
      mrr = mrr.plus(amount.dividedBy(12));
    }
  }

  // Compute ARR
  const arr = mrr.times(12);

  // Compute Churn Rate (%)
  // Formula: (Cancelled in period) / (Active at start or current population)
  const activeCount = activeSubscriptions.length;
  const denominator = activeCount + recentCancelledCount;
  const churnRate =
    denominator > 0 ? (recentCancelledCount / denominator) * 100 : 0;

  const totalPaymentsReceived = succeededPayments._sum.amount
    ? Number(succeededPayments._sum.amount)
    : 0;

  return {
    totalCustomers,
    totalActiveSubscriptions: activeCount,
    mrr: Number(mrr.toFixed(2)),
    arr: Number(arr.toFixed(2)),
    totalPaymentsReceived,
    churnRate: Number(churnRate.toFixed(1)),
    upcomingRenewals: upcomingRenewalsCount,
    pendingInvoices: pendingInvoicesCount,
  };
}

/**
 * Generates monthly revenue and MRR growth series based on actual payments and subscriptions.
 */
export async function getRevenueAnalytics(range: DateRangeFilter = "6m") {
  const startDate = getStartDateFromRange(range);
  const now = new Date();

  // Create monthly buckets
  const months = eachMonthOfInterval({ start: startDate, end: now });

  const [payments, subscriptions, customers] = await Promise.all([
    prisma.payment.findMany({
      where: {
        status: "SUCCEEDED",
        createdAt: { gte: startDate },
      },
      select: { amount: true, createdAt: true },
    }),
    prisma.subscription.findMany({
      where: { createdAt: { gte: startDate } },
      include: { price: true },
    }),
    prisma.customer.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    }),
  ]);

  const monthlyData = months.map((m) => {
    const mStart = startOfMonth(m);
    const mEnd = endOfMonth(m);
    const label = format(m, "MMM yyyy");

    // Monthly actual revenue from succeeded payments
    const monthRevenue = payments
      .filter((p) => p.createdAt >= mStart && p.createdAt <= mEnd)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Subscriptions created in this month
    const monthSubs = subscriptions.filter(
      (s) => s.createdAt >= mStart && s.createdAt <= mEnd
    );

    let monthMRR = 0;
    for (const sub of monthSubs) {
      if (sub.price.billingInterval === "MONTHLY") {
        monthMRR += Number(sub.price.amount);
      } else if (sub.price.billingInterval === "YEARLY") {
        monthMRR += Number(sub.price.amount) / 12;
      }
    }

    // New customers in month
    const newCustomers = customers.filter(
      (c) => c.createdAt >= mStart && c.createdAt <= mEnd
    ).length;

    return {
      month: label,
      revenue: Number(monthRevenue.toFixed(2)),
      mrr: Number(monthMRR.toFixed(2)),
      newCustomers,
    };
  });

  return monthlyData;
}

/**
 * Distribution of subscription and payment statuses.
 */
export async function getSubscriptionDistribution() {
  const [subCounts, pmtCounts] = await Promise.all([
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.payment.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

  const subscriptionStatusMap = {
    ACTIVE: 0,
    PAUSED: 0,
    CANCELLED: 0,
    PAST_DUE: 0,
  };
  for (const item of subCounts) {
    subscriptionStatusMap[item.status] = item._count.status;
  }

  const paymentStatusMap = {
    SUCCEEDED: 0,
    PENDING: 0,
    FAILED: 0,
  };
  for (const item of pmtCounts) {
    paymentStatusMap[item.status] = item._count.status;
  }

  return {
    subscriptions: [
      { name: "Active", value: subscriptionStatusMap.ACTIVE, color: "#16A34A" },
      { name: "Paused", value: subscriptionStatusMap.PAUSED, color: "#F59E0B" },
      { name: "Past Due", value: subscriptionStatusMap.PAST_DUE, color: "#EF4444" },
      { name: "Cancelled", value: subscriptionStatusMap.CANCELLED, color: "#94A3B8" },
    ],
    payments: [
      { name: "Succeeded", value: paymentStatusMap.SUCCEEDED, color: "#16A34A" },
      { name: "Pending", value: paymentStatusMap.PENDING, color: "#F59E0B" },
      { name: "Failed", value: paymentStatusMap.FAILED, color: "#EF4444" },
    ],
  };
}

/**
 * Returns recent activity records across customers, subscriptions, payments, and upcoming renewals.
 */
export async function getDashboardActivity() {
  const now = new Date();
  const next30Days = addDays(now, 30);

  const [
    recentCustomers,
    recentSubscriptions,
    recentPayments,
    recentInvoices,
    upcomingRenewals,
  ] = await Promise.all([
    prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        createdAt: true,
      },
    }),
    prisma.subscription.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, company: true } },
        price: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        invoice: { select: { id: true, invoiceNumber: true } },
      },
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { issueDate: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
      },
    }),
    prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        nextBillingDate: {
          gte: now,
          lte: next30Days,
        },
      },
      take: 5,
      orderBy: { nextBillingDate: "asc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        price: { include: { product: { select: { name: true } } } },
      },
    }),
  ]);

  return {
    recentCustomers,
    recentSubscriptions,
    recentPayments,
    recentInvoices,
    upcomingRenewals,
  };
}
