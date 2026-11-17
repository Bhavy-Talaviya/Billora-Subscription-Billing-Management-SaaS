import { z } from "zod";

export const customerSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(100, "Email cannot exceed 100 characters")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(100, "Company name cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  billingAddress: z
    .string()
    .max(200, "Billing address cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(100, "City cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  state: z
    .string()
    .max(100, "State cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  postalCode: z
    .string()
    .max(20, "Postal code cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
  country: z
    .string()
    .max(100, "Country cannot exceed 100 characters")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updateCustomerSchema = customerSchema.partial();

export type CustomerInput = z.infer<typeof customerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
