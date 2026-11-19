import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
});

export const createInvoiceSchema = z
  .object({
    customerId: z.string().min(1, "Customer is required"),
    subscriptionId: z.string().nullable().optional(),
    invoiceNumber: z.string().optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().min(1, "Due date is required"),
    discount: z.number().min(0, "Discount cannot be negative").default(0),
    tax: z.number().min(0, "Tax cannot be negative").default(0),
    status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE"]).default("PENDING"),
    notes: z.string().nullable().optional(),
    items: z
      .array(invoiceItemSchema)
      .min(1, "Invoice must contain at least one line item"),
  })
  .refine(
    (data) => {
      const subtotal = data.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );
      return data.discount <= subtotal;
    },
    {
      message: "Discount cannot exceed subtotal amount",
      path: ["discount"],
    }
  );

export const updateInvoiceSchema = z
  .object({
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    discount: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    status: z.enum(["DRAFT", "PENDING", "PAID", "OVERDUE"]).optional(),
    notes: z.string().nullable().optional(),
    items: z.array(invoiceItemSchema).min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.items && data.discount !== undefined) {
        const subtotal = data.items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0
        );
        return data.discount <= subtotal;
      }
      return true;
    },
    {
      message: "Discount cannot exceed subtotal amount",
      path: ["discount"],
    }
  );

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
