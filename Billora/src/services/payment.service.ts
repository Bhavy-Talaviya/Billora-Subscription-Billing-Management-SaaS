import prisma from "@/lib/prisma";
import {
  CreatePaymentInput,
  UpdatePaymentStatusInput,
} from "@/lib/validations/payment";
import { Prisma, PaymentStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface GetPaymentsParams {
  search?: string;
  status?: string;
  method?: string;
  customerId?: string;
  invoiceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Generate a unique, professional transaction reference: TXN-YYYYMMDD-XXXXXX
 */
export async function generateTransactionReference(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  let ref = `TXN-${dateStr}-${randomSuffix}`;

  let exists = await prisma.payment.findUnique({
    where: { transactionReference: ref },
  });
  while (exists) {
    const newSuffix = Math.floor(100000 + Math.random() * 900000);
    ref = `TXN-${dateStr}-${newSuffix}`;
    exists = await prisma.payment.findUnique({
      where: { transactionReference: ref },
    });
  }

  return ref;
}

/**
 * Calculate the remaining unpaid balance of an invoice scoped by tenant.
 */
export async function getInvoiceBalance(invoiceId: string, userId?: string | null) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      ...(userId ? { userId } : {}),
    },
    include: {
      payments: {
        where: { status: "SUCCEEDED" },
      },
      customer: {
        select: { id: true, name: true, email: true, company: true },
      },
    },
  });

  if (!invoice) throw new Error("Invoice not found.");

  const paidAmount = invoice.payments.reduce(
    (acc, p) => acc.plus(p.amount),
    new Decimal(0)
  );
  const remainingBalance = Decimal.max(0, invoice.total.minus(paidAmount));

  return {
    invoice,
    total: invoice.total,
    paidAmount,
    remainingBalance,
    isFullyPaid: remainingBalance.equals(0),
  };
}

/**
 * List all payments with filtering, search, pagination scoped by tenant (userId).
 */
export async function getPayments(
  params: GetPaymentsParams = {},
  userId?: string | null
) {
  const {
    search = "",
    status,
    method,
    customerId,
    invoiceId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {
    ...(userId ? { userId } : {}),
  };

  if (status && status !== "all") {
    where.status = status as PaymentStatus;
  }

  if (method && method !== "all") {
    where.paymentMethod = { contains: method, mode: "insensitive" };
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (invoiceId) {
    where.invoiceId = invoiceId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  if (search.trim()) {
    const s = search.trim();
    where.AND = [
      ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
      {
        OR: [
          { transactionReference: { contains: s, mode: "insensitive" } },
          { invoice: { invoiceNumber: { contains: s, mode: "insensitive" } } },
          { customer: { name: { contains: s, mode: "insensitive" } } },
          { customer: { email: { contains: s, mode: "insensitive" } } },
          { customer: { company: { contains: s, mode: "insensitive" } } },
        ],
      },
    ];
  }

  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            total: true,
            status: true,
          },
        },
      },
    }),
  ]);

  return {
    payments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get payment transaction details by ID scoped by tenant.
 */
export async function getPaymentById(id: string, userId?: string | null) {
  const payment = await prisma.payment.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
    include: {
      customer: true,
      invoice: {
        include: {
          items: true,
          payments: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  return payment;
}

/**
 * Record a payment against an invoice scoped by tenant (userId).
 */
export async function recordPayment(
  data: CreatePaymentInput,
  userId?: string | null
) {
  const paymentAmount = new Decimal(data.amount);

  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({
      where: {
        id: data.invoiceId,
        ...(userId ? { userId } : {}),
      },
      include: {
        payments: {
          where: { status: "SUCCEEDED" },
        },
      },
    });

    if (!invoice) throw new Error("Invoice not found.");

    if (invoice.status === "DRAFT") {
      throw new Error(
        "Cannot record payment for an invoice in DRAFT status. Please finalize/issue the invoice first."
      );
    }

    const existingPaid = invoice.payments.reduce(
      (sum, p) => sum.plus(p.amount),
      new Decimal(0)
    );
    const remainingBalance = invoice.total.minus(existingPaid);

    if (remainingBalance.lessThanOrEqualTo(0) && invoice.status === "PAID") {
      throw new Error("This invoice has already been fully paid.");
    }

    if (data.status === "SUCCEEDED" && paymentAmount.greaterThan(remainingBalance)) {
      throw new Error(
        `Overpayment rejected. The remaining balance for invoice #${invoice.invoiceNumber} is $${remainingBalance.toFixed(
          2
        )}, but attempted payment amount is $${paymentAmount.toFixed(2)}.`
      );
    }

    let paymentMethodLabel: string = data.paymentMethod;
    if (data.paymentMethod === "CARD") {
      paymentMethodLabel = data.maskedDetails || "Card (•••• 4242)";
    } else if (data.paymentMethod === "BANK_TRANSFER") {
      paymentMethodLabel = data.maskedDetails || "Bank Transfer (ACH/Wire)";
    } else if (data.paymentMethod === "UPI") {
      paymentMethodLabel = data.maskedDetails || "UPI (••••@bank)";
    } else if (data.paymentMethod === "CASH") {
      paymentMethodLabel = "Cash on Delivery / Direct";
    }

    const txRef =
      data.transactionReference || (await generateTransactionReference());
    const paidAtDate =
      data.status === "SUCCEEDED"
        ? data.paymentDate
          ? new Date(data.paymentDate)
          : new Date()
        : null;

    const payment = await tx.payment.create({
      data: {
        userId: userId || null,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        amount: paymentAmount,
        paymentMethod: paymentMethodLabel,
        status: data.status,
        transactionReference: txRef,
        paidAt: paidAtDate,
        createdAt: data.paymentDate ? new Date(data.paymentDate) : new Date(),
      },
      include: {
        customer: true,
        invoice: true,
      },
    });

    if (data.status === "SUCCEEDED") {
      const newTotalPaid = existingPaid.plus(paymentAmount);
      if (newTotalPaid.greaterThanOrEqualTo(invoice.total)) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID" },
        });
      }
    }

    return payment;
  });
}

/**
 * Update payment status scoped by tenant.
 */
export async function updatePaymentStatus(
  id: string,
  data: UpdatePaymentStatusInput,
  userId?: string | null
) {
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: {
        id,
        ...(userId ? { userId } : {}),
      },
      include: {
        invoice: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!payment) throw new Error("Payment record not found.");

    if (payment.status === data.status) {
      return payment;
    }

    const updatedPayment = await tx.payment.update({
      where: { id },
      data: {
        status: data.status,
        paidAt: data.status === "SUCCEEDED" ? new Date() : null,
      },
      include: {
        customer: true,
        invoice: true,
      },
    });

    const allSucceeded = payment.invoice.payments
      .filter((p) => (p.id === id ? data.status === "SUCCEEDED" : p.status === "SUCCEEDED"))
      .reduce((sum, p) => sum.plus(p.amount), new Decimal(0));

    const invoiceTotal = payment.invoice.total;

    if (allSucceeded.greaterThanOrEqualTo(invoiceTotal)) {
      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: "PAID" },
      });
    } else {
      const isOverdue = payment.invoice.dueDate < new Date();
      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { status: isOverdue ? "OVERDUE" : "PENDING" },
      });
    }

    return updatedPayment;
  });
}
