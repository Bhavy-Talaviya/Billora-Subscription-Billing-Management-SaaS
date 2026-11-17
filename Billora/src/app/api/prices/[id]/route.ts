import { NextRequest, NextResponse } from "next/server";
import { updatePrice, deletePrice } from "@/services/price.service";
import { updatePriceSchema } from "@/lib/validations/product";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.amount !== undefined) body.amount = Number(body.amount);
    const parsed = updatePriceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const updated = await updatePrice(id, parsed.data);
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
    await deletePrice(id);
    return NextResponse.json({ message: "Price deleted successfully." });
  } catch (error: any) {
    const isNotFound = error.message?.includes("not found");
    const isRestricted = error.message?.includes("Cannot delete");
    return NextResponse.json(
      { error: error.message ?? "Server error" },
      { status: isNotFound ? 404 : isRestricted ? 400 : 500 }
    );
  }
}
