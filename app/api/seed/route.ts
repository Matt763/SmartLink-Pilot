import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Hash for 'admin123' generated pre-emptively
    const hashedPassword = "$2a$10$wT0a7dK2u8fXZpL8/kUXY.pC/6X3vT7M2aMvQjV6L8u/JzK8Y1s3C";
    
    await prisma.user.upsert({
      where: { email: 'admin@smartlink.com' },
      update: {},
      create: {
        email: 'admin@smartlink.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
      },
    });
    
    return NextResponse.json({ success: true, message: 'Admin created', email: 'admin@smartlink.com', password: 'admin123' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
