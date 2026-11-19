import { describe, it, expect } from "vitest";
import { formatPrice, formatIntervalLabel } from "@/lib/utils/currency";

describe("Currency and Price Formatting Utilities", () => {
  it("formats USD monthly prices correctly", () => {
    const formatted = formatPrice(29, "USD", "MONTHLY");
    expect(formatted).toBe("$29/month");
  });

  it("formats fractional monthly prices with two decimal digits", () => {
    const formatted = formatPrice(29.99, "USD", "MONTHLY");
    expect(formatted).toBe("$29.99/month");
  });

  it("formats USD yearly prices correctly", () => {
    const formatted = formatPrice(290, "USD", "YEARLY");
    expect(formatted).toBe("$290/year");
  });

  it("formats one-time prices without interval denominator", () => {
    const formatted = formatPrice(499, "USD", "ONE_TIME");
    expect(formatted).toBe("$499 one-time");
  });

  it("formats INR currency correctly with rupee symbol", () => {
    const formatted = formatPrice(999, "INR", "MONTHLY");
    expect(formatted).toBe("₹999/month");
  });

  it("formats EUR currency correctly", () => {
    const formatted = formatPrice(49, "EUR", "MONTHLY");
    expect(formatted).toBe("€49/month");
  });

  it("formats interval labels properly", () => {
    expect(formatIntervalLabel("MONTHLY")).toBe("Monthly");
    expect(formatIntervalLabel("YEARLY")).toBe("Yearly");
    expect(formatIntervalLabel("ONE_TIME")).toBe("One-time");
  });
});
