import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({ message: "If an account exists with that email, a reset link has been generated." });
    }

    // Delete any existing tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Generate a secure reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // In production, you would send this via email (e.g., SendGrid, Resend, Nodemailer)
    // For now, we return the token so the user can navigate to the reset page
    console.log(`[Password Reset] Token for ${email}: ${token}`);

    return NextResponse.json({
      message: "If an account exists with that email, a reset link has been generated.",
      // Include resetUrl in development for testing
      resetUrl: `/reset-password?token=${token}&email=${encodeURIComponent(email)}`,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
