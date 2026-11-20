import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById, updateUserProfile } from "@/services/auth.service";
import { updateProfileSchema } from "@/lib/validations/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[GET /api/auth/me]", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await updateUserProfile(session.user.id, parsed.data);

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: updated,
    });
  } catch (error: any) {
    console.error("[PATCH /api/auth/me]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile." },
      { status: 400 }
    );
  }
}
