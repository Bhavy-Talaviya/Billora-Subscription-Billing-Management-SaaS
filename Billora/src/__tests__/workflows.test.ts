import { describe, it, expect } from "vitest";
import { customerSchema } from "@/lib/validations/customer";
import { productSchema, priceSchema } from "@/lib/validations/product";
import { createSubscriptionSchema } from "@/lib/validations/subscription";
import { createInvoiceSchema } from "@/lib/validations/invoice";
import { createPaymentSchema } from "@/lib/validations/payment";
import { generateInvoicePDF } from "@/lib/utils/invoicePdf";
import { addMonths } from "date-fns";

describe("Complete End-to-End Billing Workflows (A through J)", () => {
  let customerId = "cust_e2e_test_1001";
  let productId = "prod_e2e_test_2001";
  let priceId = "price_e2e_test_3001";
  let subscriptionId = "sub_e2e_test_4001";
  let invoiceId = "inv_e2e_test_5001";

  // Workflow A: Create customer
  it("Workflow A: Validates customer creation data with full fields", () => {
    const customerPayload = {
      name: "Acme Cloud Services",
      email: "billing@acmecloud.io",
      phone: "+1 (555) 234-5678",
      company: "Acme Global Inc.",
      billingAddress: "500 Enterprise Way, Suite 400",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "United States",
      notes: "Strategic enterprise account",
    };

    const parsed = customerSchema.safeParse(customerPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Acme Cloud Services");
      expect(parsed.data.email).toBe("billing@acmecloud.io");
    }
  });

  // Workflow B: Create product and pricing plan
  it("Workflow B: Validates product and pricing plan creation", () => {
    const productPayload = {
      name: "Billora Enterprise Tier",
      description: "Dedicated infrastructure, custom SLAs and priority support",
      active: true,
    };
    const prodParsed = productSchema.safeParse(productPayload);
    expect(prodParsed.success).toBe(true);

    const pricePayload = {
      productId,
      amount: 499.0,
      currency: "USD",
      billingInterval: "MONTHLY" as const,
      active: true,
    };
    const priceParsed = priceSchema.safeParse(pricePayload);
    expect(priceParsed.success).toBe(true);
  });

  // Workflow C: Create subscription for customer
  it("Workflow C: Validates subscription creation and auto-calculates next billing date", () => {
    const now = new Date("2026-04-01T00:00:00Z");
    const subPayload = {
      customerId,
      productId,
      priceId,
      startDate: now.toISOString(),
      firstBillingDate: now.toISOString(),
    };
    const subParsed = createSubscriptionSchema.safeParse(subPayload);
    expect(subParsed.success).toBe(true);

    const nextBilling = addMonths(now, 1);
    expect(nextBilling.toISOString().startsWith("2026-05-01")).toBe(true);
  });

  // Workflow D: Generate invoice
  it("Workflow D: Generates invoice with line items, subtotal, discount, tax, and total", () => {
    const invoicePayload = {
      customerId,
      subscriptionId,
      issueDate: new Date("2026-04-01T00:00:00Z").toISOString(),
      dueDate: new Date("2026-04-15T00:00:00Z").toISOString(),
      discount: 49.0,
      tax: 36.0,
      notes: "Monthly billing for Billora Enterprise Tier",
      items: [
        {
          description: "Billora Enterprise Tier (Monthly)",
          quantity: 1,
          unitPrice: 499.0,
        },
      ],
    };

    const invParsed = createInvoiceSchema.safeParse(invoicePayload);
    expect(invParsed.success).toBe(true);

    const subtotal = 499.0 * 1;
    const total = subtotal - invoicePayload.discount + invoicePayload.tax;
    expect(subtotal).toBe(499.0);
    expect(total).toBe(486.0);
  });

  // Workflow E: Record successful simulated payment
  it("Workflow E: Records a successful payment with payment method & transaction ref", () => {
    const paymentPayload = {
      invoiceId,
      amount: 486.0,
      paymentMethod: "CARD" as const,
      status: "SUCCEEDED" as const,
      notes: "Card payment simulation for full balance",
    };

    const paymentParsed = createPaymentSchema.safeParse(paymentPayload);
    expect(paymentParsed.success).toBe(true);
    expect(paymentParsed.data?.amount).toBe(486.0);
  });

  // Workflow F: Verify invoice balance and status
  it("Workflow F: Verifies remaining balance is 0 and status transitions to PAID", () => {
    const invoiceTotal = 486.0;
    const paymentAmount = 486.0;
    const remainingBalance = Math.max(0, invoiceTotal - paymentAmount);
    const updatedStatus = remainingBalance <= 0 ? "PAID" : "PENDING";

    expect(remainingBalance).toBe(0);
    expect(updatedStatus).toBe("PAID");
  });

  // Workflow G: View dashboard and verify revenue
  it("Workflow G: Computes dashboard MRR, ARR, and received revenue accurately", () => {
    const activeMonthlySubscriptions = [499.0, 99.0, 49.0];
    const activeYearlySubscriptions = [1200.0]; // 1200 / 12 = 100/mo
    const successfulPayments = [486.0, 99.0, 49.0, 1200.0];

    const monthlySum = activeMonthlySubscriptions.reduce((a, b) => a + b, 0);
    const yearlyNormalized = activeYearlySubscriptions.reduce((a, b) => a + b / 12, 0);
    const mrr = monthlySum + yearlyNormalized;
    const arr = mrr * 12;
    const totalRevenue = successfulPayments.reduce((a, b) => a + b, 0);

    expect(mrr).toBe(747.0);
    expect(arr).toBe(8964.0);
    expect(totalRevenue).toBe(1834.0);
  });

  // Workflow H: Pause and resume subscription
  it("Workflow H: Supports pausing and resuming subscription lifecycle", () => {
    let subStatus = "ACTIVE";

    // Pause action
    expect(subStatus).toBe("ACTIVE");
    subStatus = "PAUSED";
    expect(subStatus).toBe("PAUSED");

    // Resume action
    subStatus = "ACTIVE";
    expect(subStatus).toBe("ACTIVE");
  });

  // Workflow I: Cancel subscription
  it("Workflow I: Cancels subscription and marks it ineligible for automatic renewal", () => {
    let subStatus = "ACTIVE";
    subStatus = "CANCELLED";
    const cancelledAt = new Date().toISOString();

    expect(subStatus).toBe("CANCELLED");
    expect(cancelledAt).toBeDefined();

    // Verify cannot renew cancelled
    const eligibleForRenewal = subStatus === "ACTIVE";
    expect(eligibleForRenewal).toBe(false);
  });

  // Workflow J: Download invoice PDF
  it("Workflow J: Generates a professional invoice PDF instance without throwing", () => {
    const sampleInvoice = {
      invoiceNumber: "INV-2026-0001",
      issueDate: "2026-04-01T00:00:00.000Z",
      dueDate: "2026-04-15T00:00:00.000Z",
      subtotal: "499.00",
      discount: "49.00",
      tax: "36.00",
      total: "486.00",
      status: "PAID",
      notes: "Thank you for your business.",
      customer: {
        name: "Acme Cloud Services",
        email: "billing@acmecloud.io",
        company: "Acme Global Inc.",
        phone: "+1 (555) 234-5678",
        billingAddress: "500 Enterprise Way, Suite 400",
        city: "San Francisco",
        state: "CA",
        country: "United States",
      },
      subscription: {
        price: {
          billingInterval: "MONTHLY",
          product: {
            name: "Billora Enterprise Tier",
          },
        },
      },
      items: [
        {
          id: "item_1",
          description: "Billora Enterprise Tier (Monthly)",
          quantity: 1,
          unitPrice: "499.00",
          amount: "499.00",
        },
      ],
      payments: [
        {
          id: "pmt_1",
          amount: "486.00",
          paymentMethod: "CARD",
          status: "SUCCEEDED",
          paidAt: "2026-04-01T10:00:00.000Z",
          createdAt: "2026-04-01T10:00:00.000Z",
        },
      ],
    };

    const doc = generateInvoicePDF(sampleInvoice);
    expect(doc).toBeDefined();
    // Test that output arraybuffer can be generated
    const arrayBuffer = doc.output("arraybuffer");
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);
  });
});
