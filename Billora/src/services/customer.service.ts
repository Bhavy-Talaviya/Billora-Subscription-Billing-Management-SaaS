import prisma from "@/lib/prisma";
import { CustomerInput, UpdateCustomerInput } from "@/lib/validations/customer";
import { Prisma } from "@prisma/client";

export interface GetCustomersParams {
  search?: string;
  page?: number;
  limit?: number;
  country?: string;
  sortBy?: "name" | "createdAt" | "company";
  sortOrder?: "asc" | "desc";
}

export async function getCustomers(params: GetCustomersParams = {}) {
  const {
    search = "",
    page = 1,
    limit = 10,
    country,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {};

  if (search.trim()) {
    const s = search.trim();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { company: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
    ];
  }

  if (country && country !== "all") {
    where.country = { equals: country, mode: "insensitive" };
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: {
            subscriptions: true,
            invoices: true,
            payments: true,
          },
        },
      },
    }),
  ]);

  return {
    customers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        include: {
          price: {
            include: {
              product: true,
            },
          },
        },
      },
      invoices: {
        orderBy: { issueDate: "desc" },
        include: {
          items: true,
          payments: true,
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              total: true,
            },
          },
        },
      },
      _count: {
        select: {
          subscriptions: true,
          invoices: true,
          payments: true,
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const totalAmountPaid = customer.payments
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const activeSubscriptionsCount = customer.subscriptions.filter(
    (s) => s.status === "ACTIVE"
  ).length;

  return {
    ...customer,
    stats: {
      totalAmountPaid,
      activeSubscriptionsCount,
      totalInvoicesCount: customer.invoices.length,
      totalPaymentsCount: customer.payments.length,
    },
  };
}

export async function createCustomer(data: CustomerInput) {
  const existing = await prisma.customer.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error("A customer with this email address already exists.");
  }

  return prisma.customer.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      billingAddress: data.billingAddress || null,
      city: data.city || null,
      state: data.state || null,
      postalCode: data.postalCode || null,
      country: data.country || null,
      notes: data.notes || null,
    },
    include: {
      _count: {
        select: {
          subscriptions: true,
          invoices: true,
          payments: true,
        },
      },
    },
  });
}

export async function updateCustomer(id: string, data: UpdateCustomerInput) {
  const existing = await prisma.customer.findUnique({ where: { id } });

  if (!existing) {
    throw new Error("Customer not found.");
  }

  if (data.email && data.email !== existing.email) {
    const emailInUse = await prisma.customer.findUnique({
      where: { email: data.email },
    });
    if (emailInUse) {
      throw new Error("A customer with this email address already exists.");
    }
  }

  return prisma.customer.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.company !== undefined && { company: data.company || null }),
      ...(data.billingAddress !== undefined && { billingAddress: data.billingAddress || null }),
      ...(data.city !== undefined && { city: data.city || null }),
      ...(data.state !== undefined && { state: data.state || null }),
      ...(data.postalCode !== undefined && { postalCode: data.postalCode || null }),
      ...(data.country !== undefined && { country: data.country || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
    include: {
      _count: {
        select: { subscriptions: true, invoices: true, payments: true },
      },
    },
  });
}

/**
 * SAFE DELETION POLICY
 * Customers with any financial history (active/paused subscriptions,
 * paid/pending/overdue invoices, or succeeded/pending payments) CANNOT
 * be hard-deleted. This preserves ledger integrity and audit trails.
 * Only customers with zero financial records (e.g. draft-only or test profiles)
 * can be permanently removed.
 */
export async function deleteCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      subscriptions: {
        where: { status: { in: ["ACTIVE", "PAUSED", "PAST_DUE"] } },
      },
      invoices: {
        where: { status: { in: ["PAID", "PENDING", "OVERDUE"] } },
      },
      payments: {
        where: { status: { in: ["SUCCEEDED", "PENDING"] } },
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  if (customer.subscriptions.length > 0) {
    throw new Error(
      `Cannot delete customer: ${customer.name} has ${customer.subscriptions.length} active/pending subscription(s). Cancel them first.`
    );
  }

  if (customer.invoices.length > 0) {
    throw new Error(
      `Cannot delete customer: ${customer.name} has ${customer.invoices.length} invoice record(s) required for accounting compliance.`
    );
  }

  if (customer.payments.length > 0) {
    throw new Error(
      `Cannot delete customer: ${customer.name} has ${customer.payments.length} payment transaction(s).`
    );
  }

  return prisma.customer.delete({ where: { id } });
}
