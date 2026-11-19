import { z } from "zod";

export const PAYMENT_METHODS = [
  "CARD",
  "BANK_TRANSFER",
  "UPI",
  "CASH",
] as const;

export const PAYMENT_STATUSES = [
  "SUCCEEDED",
  "PENDING",
  "FAILED",
] as const;

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice selection is required"),
  amount: z
    .number()
    .positive("Payment amount must be greater than zero")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: "Please select a valid payment method" }),
  }),
  paymentDate: z.string().optional(),
  status: z.enum(PAYMENT_STATUSES).default("SUCCEEDED"),
  maskedDetails: z.string().optional(), // Masked label e.g., "Card ending •••• 4242"
  transactionReference: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(PAYMENT_STATUSES),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
