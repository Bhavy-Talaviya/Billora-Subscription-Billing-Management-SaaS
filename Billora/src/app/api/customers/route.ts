import { NextRequest, NextResponse } from "next/server";
import { getCustomers, createCustomer } from "@/services/customer.service";
import { customerSchema } from "@/lib/validations/customer";
import { getSessionUserId } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const country = searchParams.get("country") || undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as any) || "desc";

    const userId = await getSessionUserId();

    const result = await getCustomers(
      {
        search,
        page: isNaN(page) ? 1 : page,
        limit: isNaN(limit) ? 10 : limit,
        country,
        sortBy,
        sortOrder,
      },
      userId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = customerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const userId = await getSessionUserId();
    const customer = await createCustomer(validationResult.data, userId);
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create customer" },
      { status: 400 }
    );
  }
}
