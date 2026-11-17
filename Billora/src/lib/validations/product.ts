import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  active: z.boolean().optional().default(true),
});

export const updateProductSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const priceSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code")
    .toUpperCase()
    .default("USD"),
  billingInterval: z.enum(["MONTHLY", "YEARLY", "ONE_TIME"], {
    errorMap: () => ({ message: "Invalid billing interval" }),
  }),
  active: z.boolean().optional().default(true),
});

export const updatePriceSchema = priceSchema.omit({ productId: true }).partial();

export type PriceInput = z.infer<typeof priceSchema>;
export type UpdatePriceInput = z.infer<typeof updatePriceSchema>;
