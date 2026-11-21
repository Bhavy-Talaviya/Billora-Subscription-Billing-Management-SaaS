import { NextRequest, NextResponse } from "next/server";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import { updateProductSchema } from "@/lib/validations/product";
import { getSessionUserId } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const product = await getProductById(id, userId);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const userId = await getSessionUserId();
    const updated = await updateProduct(id, parsed.data, userId);
    return NextResponse.json(updated);
  } catch (error: any) {
    const isNotFound = error.message?.includes("not found");
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: isNotFound ? 404 : 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    await deleteProduct(id, userId);
    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (error: any) {
    const isNotFound = error.message?.includes("not found");
    const isRestricted = error.message?.includes("Cannot delete");
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: isNotFound ? 404 : isRestricted ? 400 : 500 }
    );
  }
}
