import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/services/customer.service";
import { updateCustomerSchema } from "@/lib/validations/customer";
import { getSessionUserId } from "@/lib/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const userId = await getSessionUserId();
    const customer = await getCustomerById(id, userId);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve customer details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = updateCustomerSchema.safeParse(body);
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
    const updated = await updateCustomer(id, validationResult.data, userId);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/customers/[id] error:", error);
    const isNotFound = error.message?.includes("not found");
    const isDuplicate = error.message?.includes("already exists");
    return NextResponse.json(
      { error: error.message || "Failed to update customer" },
      { status: isNotFound ? 404 : isDuplicate ? 409 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    const userId = await getSessionUserId();
    await deleteCustomer(id, userId);
    return NextResponse.json(
      { message: "Customer deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE /api/customers/[id] error:", error);
    const isNotFound = error.message?.includes("not found");
    return NextResponse.json(
      { error: error.message || "Failed to delete customer" },
      { status: isNotFound ? 404 : 400 }
    );
  }
}
