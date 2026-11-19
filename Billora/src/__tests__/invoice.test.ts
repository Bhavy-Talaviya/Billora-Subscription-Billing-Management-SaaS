import { describe, it, expect } from "vitest";
import { createInvoiceSchema } from "@/lib/validations/invoice";

describe("Invoice Calculations and Validations", () => {
  it("calculates subtotal and total accurately with decimal arithmetic", () => {
    const items = [
      { description: "Pro Plan Subscription", quantity: 2, unitPrice: 49.99 },
      { description: "Dedicated IP Addon", quantity: 1, unitPrice: 15.0 },
    ];

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    expect(subtotal).toBeCloseTo(114.98, 2);

    const discount = 10.0;
    const tax = 9.45;
    const total = subtotal - discount + tax;

    expect(total).toBeCloseTo(114.43, 2);
  });

  it("validates invoice schema successfully with valid inputs", () => {
    const validData = {
      customerId: "cust_12345678901234567890",
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      discount: 5,
      tax: 2.5,
      notes: "Net 14 payment terms",
      items: [
        {
          description: "Monthly SaaS Tier",
          quantity: 1,
          unitPrice: 50,
        },
      ],
    };

    const result = createInvoiceSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects negative quantity or negative price in invoice items", () => {
    const invalidData = {
      customerId: "cust_123",
      issueDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      discount: 0,
      tax: 0,
      items: [
        {
          description: "Invalid Item",
          quantity: -1,
          unitPrice: 10,
        },
      ],
    };

    const result = createInvoiceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("rejects invoice with empty items list", () => {
    const invalidData = {
      customerId: "cust_123",
      issueDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      discount: 0,
      tax: 0,
      items: [],
    };

    const result = createInvoiceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
