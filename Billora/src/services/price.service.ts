import prisma from "@/lib/prisma";
import { PriceInput, UpdatePriceInput } from "@/lib/validations/product";
import { Decimal } from "@prisma/client/runtime/library";

export async function getPrices(params: { productId?: string; active?: boolean } = {}) {
  const where: any = {};
  if (params.productId) where.productId = params.productId;
  if (params.active !== undefined) where.active = params.active;

  return prisma.price.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      product: { select: { id: true, name: true, active: true } },
      _count: { select: { subscriptions: true } },
    },
  });
}

export async function createPrice(data: PriceInput) {
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) throw new Error("Product not found.");

  return prisma.price.create({
    data: {
      productId: data.productId,
      amount: new Decimal(data.amount),
      currency: data.currency || "USD",
      billingInterval: data.billingInterval,
      active: data.active ?? true,
    },
    include: {
      product: { select: { id: true, name: true } },
      _count: { select: { subscriptions: true } },
    },
  });
}

export async function updatePrice(id: string, data: UpdatePriceInput) {
  const existing = await prisma.price.findUnique({ where: { id } });
  if (!existing) throw new Error("Price not found.");

  return prisma.price.update({
    where: { id },
    data: {
      ...(data.amount !== undefined && { amount: new Decimal(data.amount) }),
      ...(data.currency !== undefined && { currency: data.currency }),
      ...(data.billingInterval !== undefined && { billingInterval: data.billingInterval }),
      ...(data.active !== undefined && { active: data.active }),
    },
    include: {
      product: { select: { id: true, name: true } },
      _count: { select: { subscriptions: true } },
    },
  });
}

/**
 * SAFE DELETE POLICY FOR PRICES:
 * Prices linked to any subscriptions (past or present) cannot be hard-deleted.
 * Deactivate the price instead to prevent new subscriptions while preserving history.
 */
export async function deletePrice(id: string) {
  const price = await prisma.price.findUnique({
    where: { id },
    include: { _count: { select: { subscriptions: true } } },
  });

  if (!price) throw new Error("Price not found.");

  if (price._count.subscriptions > 0) {
    throw new Error(
      `Cannot delete this pricing plan: it is linked to ${price._count.subscriptions} subscription(s). Deactivate it instead to preserve historical billing data.`
    );
  }

  return prisma.price.delete({ where: { id } });
}
