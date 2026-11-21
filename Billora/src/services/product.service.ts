import prisma from "@/lib/prisma";
import { ProductInput, UpdateProductInput } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";

export interface GetProductsParams {
  search?: string;
  active?: boolean | null;
  page?: number;
  limit?: number;
}

export async function getProducts(
  params: GetProductsParams = {},
  userId?: string | null
) {
  const { search = "", page = 1, limit = 20, active } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    ...(userId ? { userId } : {}),
  };

  if (search.trim()) {
    where.AND = [
      ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
      {
        OR: [
          { name: { contains: search.trim(), mode: "insensitive" } },
          { description: { contains: search.trim(), mode: "insensitive" } },
        ],
      },
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

export async function getProductById(id: string, userId?: string | null) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
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

export async function createProduct(
  data: ProductInput,
  userId?: string | null
) {
  return prisma.product.create({
    data: {
      userId: userId || null,
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

export async function updateProduct(
  id: string,
  data: UpdateProductInput,
  userId?: string | null
) {
  const existing = await prisma.product.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
  });
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

export async function deleteProduct(id: string, userId?: string | null) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      ...(userId ? { userId } : {}),
    },
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
