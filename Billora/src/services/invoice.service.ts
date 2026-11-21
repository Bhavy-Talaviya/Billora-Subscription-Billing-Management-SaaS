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
export async function syncOverdueInvoices(userId?: string | null) {
  const now = new Date();
  await prisma.invoice.updateMany({
    where: {
      status: "PENDING",
      dueDate: {
        lt: now,
      },
      ...(userId ? { userId } : {}),
    },
    data: {
      status: "OVERDUE",
    },
  });
}

/**
 * List invoices with filters, search, pagination, and customer associations scoped by tenant (userId).
 */
export async function getInvoices(
  params: GetInvoicesParams = {},
  userId?: string | null
) {
  await syncOverdueInvoices(userId);

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

  const where: Prisma.InvoiceWhereInput = {
    ...(userId ? { userId } : {}),
  };

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
    where.AND = [
      ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
      {
        OR: [
          { invoiceNumber: { contains: s, mode: "insensitive" } },
          { customer: { name: { contains: s, mode: "insensitive" } } },
          { customer: { email: { contains: s, mode: "insensitive" } } },
          { customer: { company: { contains: s, mode: "insensitive" } } },
        ],
      },
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
        payments: {
          where: { status: "SUCCEEDED" },
          select: { amount: true },
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
 * Get detailed invoice record including line items, customer, and payments scoped by tenant.
 */
export async function getInvoiceById(id: string, userId?: string | null) {
  await syncOverdueInvoices(userId);

  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
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

  let exists = await prisma.invoice.findUnique({ where: { invoiceNumber } });
  while (exists) {
    const newSuffix = Math.floor(1000 + Math.random() * 9000);
    invoiceNumber = `INV-${dateStr}-${newSuffix}`;
    exists = await prisma.invoice.findUnique({ where: { invoiceNumber } });
  }

  return invoiceNumber;
}

/**
 * Create invoice with line items scoped by tenant (userId).
 */
export async function createInvoice(
  data: CreateInvoiceInput,
  userId?: string | null
) {
  const customer = await prisma.customer.findFirst({
    where: {
      id: data.customerId,
      ...(userId ? { userId } : {}),
    },
  });
  if (!customer) throw new Error("Customer not found.");

  const invoiceNumber = data.invoiceNumber || (await generateInvoiceNumber());

  const duplicate = await prisma.invoice.findUnique({
    where: { invoiceNumber },
  });
  if (duplicate) {
    throw new Error(`Invoice number "${invoiceNumber}" already exists.`);
  }

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

  let finalStatus: InvoiceStatus = data.status || "PENDING";
  if (finalStatus === "PENDING" && dueDate < new Date()) {
    finalStatus = "OVERDUE";
  }

  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.create({
      data: {
        userId: userId || null,
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

    if (finalStatus === "PAID") {
      await tx.payment.create({
        data: {
          userId: userId || null,
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
 * Edit Draft / Pending Invoice scoped by tenant.
 */
export async function updateInvoice(
  id: string,
  data: UpdateInvoiceInput,
  userId?: string | null
) {
  const existing = await prisma.invoice.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
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

    if (data.status === "PAID" && existing.status !== "PAID") {
      await tx.payment.create({
        data: {
          userId: userId || null,
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
 * Delete Invoice scoped by tenant.
 */
export async function deleteInvoice(id: string, userId?: string | null) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
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

/**
 * Calculate invoice live balance scoped by tenant.
 */
export async function getInvoiceBalance(id: string, userId?: string | null) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      payments: {
        where: { status: "SUCCEEDED" },
        select: { amount: true },
      },
    },
  });

  if (!invoice) throw new Error("Invoice not found.");

  const total = Number(invoice.total);
  const paidAmount = invoice.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const remainingBalance = Math.max(0, total - paidAmount);
  const isFullyPaid = remainingBalance <= 0.001;

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customer: invoice.customer,
    total,
    paidAmount,
    remainingBalance: Number(remainingBalance.toFixed(2)),
    isFullyPaid,
    status: invoice.status,
  };
}
