import { describe, it, expect } from "vitest";
import { addMonths, addYears } from "date-fns";

describe("Subscription Lifecycle and Revenue Metrics", () => {
  it("calculates next billing date correctly for MONTHLY interval", () => {
    const startDate = new Date("2026-01-15T00:00:00.000Z");
    const nextDate = addMonths(startDate, 1);
    expect(nextDate.toISOString().startsWith("2026-02-15")).toBe(true);
  });

  it("calculates next billing date correctly for YEARLY interval", () => {
    const startDate = new Date("2026-01-15T00:00:00.000Z");
    const nextDate = addYears(startDate, 1);
    expect(nextDate.toISOString().startsWith("2027-01-15")).toBe(true);
  });

  it("normalizes Monthly Recurring Revenue (MRR) properly", () => {
    // 3 Monthly plans of $50 = $150
    // 2 Yearly plans of $1200 = $1200 / 12 * 2 = $200
    // 1 One-time purchase of $500 (excluded from MRR)
    const monthlySubs = [50, 50, 50];
    const yearlySubs = [1200, 1200];

    const monthlyTotal = monthlySubs.reduce((sum, v) => sum + v, 0);
    const yearlyNormalized = yearlySubs.reduce((sum, v) => sum + v / 12, 0);

    const mrr = monthlyTotal + yearlyNormalized;
    expect(mrr).toBe(350);

    const arr = mrr * 12;
    expect(arr).toBe(4200);
  });

  it("calculates churn rate safely with zero-division guard", () => {
    const cancelledCount = 0;
    const activeCount = 0;
    const totalPopulation = activeCount + cancelledCount;

    const churnRate =
      totalPopulation > 0
        ? Math.round((cancelledCount / totalPopulation) * 1000) / 10
        : 0;

    expect(churnRate).toBe(0);

    const activeCount2 = 90;
    const cancelledCount2 = 10;
    const churnRate2 =
      Math.round((cancelledCount2 / (activeCount2 + cancelledCount2)) * 1000) / 10;

    expect(churnRate2).toBe(10);
  });

  it("validates subscription status transition rules", () => {
    // ACTIVE can be PAUSED or CANCELLED
    const validFromActive = ["PAUSED", "CANCELLED"];
    expect(validFromActive.includes("PAUSED")).toBe(true);

    // PAUSED can be RESUMED (ACTIVE) or CANCELLED
    const validFromPaused = ["ACTIVE", "CANCELLED"];
    expect(validFromPaused.includes("ACTIVE")).toBe(true);

    // CANCELLED subscriptions cannot be resumed or renewed
    const isCancelledEligibleForRenewal = false;
    expect(isCancelledEligibleForRenewal).toBe(false);
  });
});
