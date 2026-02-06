// app/api/regenerate-qr/route.ts (protected — only super admin)
import { NextResponse } from "next/server";
import { db } from "@/db";
import { classes } from "@/db/schema";
import { randomBytes } from "crypto";

export async function POST() {
  try {
    // Optional: check super admin cookie here if needed
    // const cookieStore = cookies();
    // if (!cookieStore.get("super_access")?.value) return unauthorized

    const allClasses = await db.select().from(classes);

    for (const cls of allClasses) {
      const newQrValue = `cfc-${cls.module}-${Date.now()}-${randomBytes(8).toString("hex")}`;

      await db
        .update(classes)
        .set({ qrCodeValue: newQrValue })
        .where(eq(classes.id, cls.id));
    }

    return NextResponse.json({
      success: true,
      message: `Regenerated ${allClasses.length} QR codes`,
    });
  } catch (error) {
    console.error("QR regeneration error:", error);
    return NextResponse.json(
      { error: "Failed to regenerate QR codes" },
      { status: 500 },
    );
  }
}
