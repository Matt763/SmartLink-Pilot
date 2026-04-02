import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail, SENDERS } from "@/lib/resend";
import { passwordChangedByAdminEmailTemplate, accountDeletedEmailTemplate } from "@/lib/email-templates";

const CEO_EMAIL = "mclean@smartlinkpilot.com";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}

// ── GET — fetch all accounts (except CEO) ─────────────────────────────────────
export async function GET() {
  if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      image: true,
      createdAt: true,
      emailVerified: true,
      subscription: {
        select: { status: true, stripePriceId: true },
      },
      _count: {
        select: { urls: true },
      },
    },
  });

  return NextResponse.json(users);
}

// ── PATCH — change a user's password ──────────────────────────────────────────
export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });

  const { userId, newPassword } = await req.json();

  if (!userId || !newPassword) {
    return NextResponse.json({ error: "userId and newPassword are required." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (user.email === CEO_EMAIL) {
    return NextResponse.json({ error: "CEO account cannot be modified." }, { status: 403 });
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  // Email the user their new password
  try {
    const { subject, html } = passwordChangedByAdminEmailTemplate(
      user.name ?? user.email ?? "User",
      user.email!,
      newPassword
    );
    await sendEmail({ from: SENDERS.support, to: user.email!, subject, html });
  } catch (err) {
    console.error("[Accounts] Password-change email failed:", err);
  }

  return NextResponse.json({ message: "Password updated and user notified." });
}

// ── DELETE — remove an account ────────────────────────────────────────────────
export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return new NextResponse("Unauthorized", { status: 401 });

  const { userId, sendNotification } = await req.json();

  if (!userId) return NextResponse.json({ error: "userId is required." }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (user.email === CEO_EMAIL) {
    return NextResponse.json({ error: "CEO account cannot be deleted." }, { status: 403 });
  }

  // Optionally email them before deleting
  if (sendNotification && user.email) {
    try {
      const { subject, html } = accountDeletedEmailTemplate(
        user.name ?? user.email,
        user.email
      );
      await sendEmail({ from: SENDERS.support, to: user.email, subject, html });
    } catch (err) {
      console.error("[Accounts] Deletion email failed:", err);
    }
  }

  // Remove newsletter subscription too
  await prisma.newsletterSubscriber
    .deleteMany({ where: { email: user.email! } })
    .catch(() => {});

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ message: "Account deleted." });
}
