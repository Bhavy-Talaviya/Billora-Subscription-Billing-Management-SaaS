import { z } from "zod";

export const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  productId: z.string().min(1, "Product is required"),
  priceId: z.string().min(1, "Pricing plan is required"),
  startDate: z.string().optional(),
  firstBillingDate: z.string().optional(),
});

export const updateSubscriptionSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "CANCELLED", "PAST_DUE"]).optional(),
  nextBillingDate: z.string().nullable().optional(),
  currentPeriodEnd: z.string().optional(),
});

export const changePlanSchema = z.object({
  newPriceId: z.string().min(1, "New pricing plan is required"),
  effectivePolicy: z
    .enum(["IMMEDIATE", "NEXT_BILLING_DATE"])
    .default("IMMEDIATE"),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
