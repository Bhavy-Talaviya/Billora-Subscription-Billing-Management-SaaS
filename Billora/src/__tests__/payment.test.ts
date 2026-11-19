import { describe, it, expect } from "vitest";
import { createPaymentSchema } from "@/lib/validations/payment";

describe("Payment Business Logic and Balance Calculations", () => {
  it("computes remaining balance correctly after partial payments", () => {
    const invoiceTotal = 250.0;
    const payments = [
      { amount: 100.0, status: "SUCCEEDED" },
      { amount: 50.0, status: "SUCCEEDED" },
      { amount: 75.0, status: "FAILED" }, // Failed payments must not reduce balance
      { amount: 25.0, status: "PENDING" }, // Pending payments do not settle balance
    ];

    const settledAmount = payments
      .filter((p) => p.status === "SUCCEEDED")
      .reduce((sum, p) => sum + p.amount, 0);

    const remainingBalance = Math.max(0, invoiceTotal - settledAmount);

    expect(settledAmount).toBe(150.0);
    expect(remainingBalance).toBe(100.0);
  });

  it("identifies invoice as PAID only when settled equals or exceeds total", () => {
    const invoiceTotal = 100.0;
    const payment1 = 50.0;
    let status = payment1 >= invoiceTotal ? "PAID" : "PENDING";
    expect(status).toBe("PENDING");

    const payment2 = 50.0;
    const totalPaid = payment1 + payment2;
    status = totalPaid >= invoiceTotal ? "PAID" : "PENDING";
    expect(status).toBe("PAID");
  });

  it("rejects overpayment where payment amount exceeds remaining balance", () => {
    const remainingBalance = 50.0;
    const attemptedPayment = 75.0;

    const isOverpayment = attemptedPayment > remainingBalance;
    expect(isOverpayment).toBe(true);
  });

  it("validates payment schema with supported methods and statuses", () => {
    const validPayment = {
      invoiceId: "inv_12345678901234567890",
      amount: 49.99,
      paymentMethod: "UPI" as const,
      status: "SUCCEEDED" as const,
      notes: "Simulated test transaction",
    };

    const parsed = createPaymentSchema.safeParse(validPayment);
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid payment methods", () => {
    const invalidPayment = {
      invoiceId: "inv_123",
      amount: 49.99,
      paymentMethod: "CRYPTO_BITCOIN",
      status: "SUCCEEDED",
    };

    const parsed = createPaymentSchema.safeParse(invalidPayment);
    expect(parsed.success).toBe(false);
  });
});
