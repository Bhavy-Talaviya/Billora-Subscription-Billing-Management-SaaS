import prisma from "@/lib/prisma";
import {
  CreateInvoiceInput,
  UpdateInvoiceInput,
} from "@/lib/validations/invoice";
import { Prisma, InvoiceStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface GetInvoicesParams {
  search?: string;
  status?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Automatically update overdue status for pending invoices where dueDate < now.
 */
export async function syncOverdueInvoices() {
  const now = new Date();
  await prisma.invoice.updateMany({
    where: {
      status: "PENDING",
      dueDate: {
        lt: now,
      },
    },
    data: {
      status: "OVERDUE",
    },
  });
}

/**
 * List invoices with filters, search, pagination, and customer associations.
 */
export async function getInvoices(params: GetInvoicesParams = {}) {
  // Sync overdue status before listing
  await syncOverdueInvoices();

  const {
    search = "",
    status,
    customerId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.InvoiceWhereInput = {};

  if (status && status !== "all") {
    where.status = status as InvoiceStatus;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (startDate || endDate) {
    where.issueDate = {};
    if (startDate) {
      where.issueDate.gte = new Date(startDate);
    }
    if (endDate) {
      where.issueDate.lte = new Date(endDate);
    }
  }

  if (search.trim()) {
    const s = search.trim();
    where.OR = [
      { invoiceNumber: { contains: s, mode: "insensitive" } },
      { customer: { name: { contains: s, mode: "insensitive" } } },
      { customer: { email: { contains: s, mode: "insensitive" } } },
      { customer: { company: { contains: s, mode: "insensitive" } } },
    ];
  }

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { issueDate: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        items: true,
        payments: true,
        subscription: {
          select: {
            id: true,
            price: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    invoices,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Retrieve invoice by ID including line items, payments, customer, and subscription.
 */
export async function getInvoiceById(id: string) {
  // Sync overdue status
  await syncOverdueInvoices();

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      subscription: {
        include: {
          price: {
            include: {
              product: true,
            },
          },
        },
      },
      items: true,
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return invoice;
}

/**
 * Generate a unique invoice number: INV-YYYYMM-XXXX
 */
export async function generateInvoiceNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  let invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

  // Ensure uniqueness
  let exists = await prisma.invoice.findUnique({ where: { invoiceNumber } });
  while (exists) {
    const newSuffix = Math.floor(1000 + Math.random() * 9000);
    invoiceNumber = `INV-${dateStr}-${newSuffix}`;
    exists = await prisma.invoice.findUnique({ where: { invoiceNumber } });
  }

  return invoiceNumber;
}

/**
 * Create invoice with line items using decimal calculation logic:
 * Subtotal = sum of (quantity * unitPrice)
 * Total = subtotal - discount + tax
 */
export async function createInvoice(data: CreateInvoiceInput) {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
  });
  if (!customer) throw new Error("Customer not found.");

  const invoiceNumber = data.invoiceNumber || (await generateInvoiceNumber());

  // Existing check
  const duplicate = await prisma.invoice.findUnique({
    where: { invoiceNumber },
  });
  if (duplicate) {
    throw new Error(`Invoice number "${invoiceNumber}" already exists.`);
  }

  // Calculate Subtotal with Decimal precision
  let subtotal = new Decimal(0);
  const itemsToCreate = data.items.map((item) => {
    const qty = new Decimal(item.quantity);
    const price = new Decimal(item.unitPrice);
    const amount = qty.times(price);
    subtotal = subtotal.plus(amount);

    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: price,
      amount,
    };
  });

  const discount = new Decimal(data.discount || 0);
  const tax = new Decimal(data.tax || 0);

  if (discount.greaterThan(subtotal)) {
    throw new Error("Discount cannot exceed subtotal amount.");
  }

  const total = subtotal.minus(discount).plus(tax);

  const issueDate = data.issueDate ? new Date(data.issueDate) : new Date();
  const dueDate = new Date(data.dueDate);

  // Derive initial status
  let finalStatus: InvoiceStatus = data.status || "PENDING";
  if (finalStatus === "PENDING" && dueDate < new Date()) {
    finalStatus = "OVERDUE";
  }

  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        customerId: data.customerId,
        subscriptionId: data.subscriptionId || null,
        invoiceNumber,
        issueDate,
        dueDate,
        subtotal,
        discount,
        tax,
        total,
        status: finalStatus,
        notes: data.notes || null,
        items: {
          create: itemsToCreate,
        },
      },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    // If marked as PAID right away, record payment simulation
    if (finalStatus === "PAID") {
      await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          customerId: data.customerId,
          amount: total,
          paymentMethod: "DIRECT_PAYMENT",
          status: "SUCCEEDED",
          transactionReference: `PAY-${Date.now().toString().slice(-8)}`,
          paidAt: new Date(),
        },
      });
    }

    return invoice;
  });
}

/**
 * Edit Draft / Pending Invoice:
 * Only DRAFT or PENDING invoices can be updated.
 * Recalculates subtotal and total accurately.
 */
export async function updateInvoice(id: string, data: UpdateInvoiceInput) {
  const existing = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!existing) throw new Error("Invoice not found.");

  if (existing.status === "PAID") {
    throw new Error("Paid invoices cannot be modified.");
  }

  let subtotal = existing.subtotal;
  let itemsCreateUpdate: any = undefined;

  if (data.items) {
    subtotal = new Decimal(0);
    const newItems = data.items.map((item) => {
      const qty = new Decimal(item.quantity);
      const price = new Decimal(item.unitPrice);
      const amount = qty.times(price);
      subtotal = subtotal.plus(amount);

      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: price,
        amount,
      };
    });

    itemsCreateUpdate = {
      deleteMany: {},
      create: newItems,
    };
  }

  const discount =
    data.discount !== undefined ? new Decimal(data.discount) : existing.discount;
  const tax = data.tax !== undefined ? new Decimal(data.tax) : existing.tax;

  if (discount.greaterThan(subtotal)) {
    throw new Error("Discount cannot exceed subtotal amount.");
  }

  const total = subtotal.minus(discount).plus(tax);

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id },
      data: {
        ...(data.issueDate && { issueDate: new Date(data.issueDate) }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        subtotal,
        discount,
        tax,
        total,
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(itemsCreateUpdate && { items: itemsCreateUpdate }),
      },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    // If transitioned to PAID, record payment
    if (data.status === "PAID" && existing.status !== "PAID") {
      await tx.payment.create({
        data: {
          invoiceId: updated.id,
          customerId: updated.customerId,
          amount: total,
          paymentMethod: "CREDIT_CARD",
          status: "SUCCEEDED",
          transactionReference: `PAY-${Date.now().toString().slice(-8)}`,
          paidAt: new Date(),
        },
      });
    }

    return updated;
  });
}

/**
 * Delete Invoice:
 * Safe Policy: Only DRAFT invoices can be deleted.
 * Invoices that are PENDING, OVERDUE, or PAID cannot be deleted to preserve financial audit history.
 */
export async function deleteInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: true },
  });

  if (!invoice) throw new Error("Invoice not found.");

  if (invoice.status !== "DRAFT") {
    throw new Error(
      `Cannot delete invoice in '${invoice.status}' status. Only DRAFT invoices can be safely deleted to maintain accounting compliance.`
    );
  }

  if (invoice.payments.length > 0) {
    throw new Error(
      "Cannot delete invoice with attached payment transaction records."
    );
  }

  return await prisma.invoice.delete({
    where: { id },
  });
}
