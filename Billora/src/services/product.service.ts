import prisma from "@/lib/prisma";
import { ProductInput, UpdateProductInput } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";

export interface GetProductsParams {
  search?: string;
  active?: boolean | null;
  page?: number;
  limit?: number;
}

export async function getProducts(params: GetProductsParams = {}) {
  const { search = "", page = 1, limit = 20, active } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  if (active !== undefined && active !== null) {
    where.active = active;
  }

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        prices: {
          orderBy: { createdAt: "asc" },
          include: {
            _count: { select: { subscriptions: true } },
          },
        },
        _count: { select: { prices: true } },
      },
    }),
  ]);

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      prices: {
        orderBy: { createdAt: "asc" },
        include: {
          _count: { select: { subscriptions: true } },
        },
      },
      _count: { select: { prices: true } },
    },
  });
  return product;
}

export async function createProduct(data: ProductInput) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description || null,
      active: data.active ?? true,
    },
    include: {
      prices: true,
      _count: { select: { prices: true } },
    },
  });
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found.");

  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.active !== undefined && { active: data.active }),
    },
    include: {
      prices: true,
      _count: { select: { prices: true } },
    },
  });
}

/**
 * SAFE DELETE POLICY FOR PRODUCTS:
 * A product cannot be deleted if any of its prices are linked to subscriptions.
 * Deactivate the product instead to hide it from new subscriptions.
 */
export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      prices: {
        include: {
          _count: { select: { subscriptions: true } },
        },
      },
    },
  });

  if (!product) throw new Error("Product not found.");

  const hasSubscriptions = product.prices.some(
    (p) => p._count.subscriptions > 0
  );

  if (hasSubscriptions) {
    throw new Error(
      `Cannot delete "${product.name}": one or more of its pricing plans are linked to active subscriptions. Deactivate the product instead.`
    );
  }

  // Delete prices first, then product
  await prisma.price.deleteMany({ where: { productId: id } });
  return prisma.product.delete({ where: { id } });
}
