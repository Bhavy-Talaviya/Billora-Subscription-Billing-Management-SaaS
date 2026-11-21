import { NextRequest, NextResponse } from "next/server";
import { getPrices, createPrice } from "@/services/price.service";
import { priceSchema } from "@/lib/validations/product";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") ?? undefined;
    const activeParam = searchParams.get("active");
    const active =
      activeParam === "true" ? true : activeParam === "false" ? false : undefined;

    const userId = await getSessionUserId();
    const prices = await getPrices({ productId, active }, userId);
    return NextResponse.json(prices);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch prices." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.amount !== undefined) body.amount = Number(body.amount);
    const parsed = priceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const userId = await getSessionUserId();
    const price = await createPrice(parsed.data, userId);
    return NextResponse.json(price, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Server error" }, { status: 500 });
  }
}
