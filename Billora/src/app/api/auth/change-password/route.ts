import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { changeUserPassword } from "@/services/auth.service";
import { changePasswordSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await changeUserPassword(session.user.id, parsed.data);

    return NextResponse.json({
      message: "Password changed successfully.",
    });
  } catch (error: any) {
    console.error("[POST /api/auth/change-password]", error);
    return NextResponse.json(
      { error: error.message || "Failed to change password." },
      { status: 400 }
    );
  }
}
