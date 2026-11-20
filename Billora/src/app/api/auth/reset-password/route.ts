import { NextRequest, NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/services/auth.service";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await resetPasswordWithToken(parsed.data.token, parsed.data.password);

    return NextResponse.json({
      message: "Password reset successful. You can now sign in.",
    });
  } catch (error: any) {
    console.error("[POST /api/auth/reset-password]", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password." },
      { status: 400 }
    );
  }
}
