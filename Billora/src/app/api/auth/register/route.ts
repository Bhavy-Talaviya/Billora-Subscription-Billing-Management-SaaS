import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/auth.service";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const user = await registerUser(parsed.data);

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account." },
      { status: 400 }
    );
  }
}
