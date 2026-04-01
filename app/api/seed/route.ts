import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hashedPassword = "$2b$10$BVyQzdzHbixVawCr2rtBWuKABjdEXNaAuSSSKNdsOIbyFWjrllev.";

    await prisma.user.upsert({
      where: { email: 'mclean@smartlink.com' },
      update: {},
      create: {
        email: 'mclean@smartlink.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
      },
    });

    return NextResponse.json({ success: true, message: 'Admin created' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
