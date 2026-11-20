import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/services/auth.service";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { rawToken, resetUrl } = await createPasswordResetToken(
      parsed.data.email
    );

    // In production, send email via SMTP/Resend.
    // In development mode, return resetUrl so developers can test seamlessly without external SMTP.
    const isDev = process.env.NODE_ENV !== "production";

    return NextResponse.json({
      message:
        "If an account with that email exists, we have sent instructions to reset your password.",
      ...(isDev && resetUrl ? { devResetUrl: resetUrl } : {}),
    });
  } catch (error: any) {
    console.error("[POST /api/auth/forgot-password]", error);
    // Generic response to avoid revealing error states/existence
    return NextResponse.json({
      message:
        "If an account with that email exists, we have sent instructions to reset your password.",
    });
  }
}
