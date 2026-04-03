import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInvoice, PLAN_LABELS } from "@/lib/invoice";
import { sendEmail, SENDERS } from "@/lib/resend";
import { invoiceReceiptEmailTemplate } from "@/lib/email-templates";

const PLAN_ROLES: Record<string, string> = {
  pro: "premium_user",
  enterprise: "enterprise_user",
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const planName: string = body.planName || "pro";
    const role = PLAN_ROLES[planName] || "premium_user";

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
      select: { name: true, email: true },
    });

    // Create invoice + send receipt
    try {
      const invoice = await createInvoice({ userId: session.user.id, planName });
      if (user.email) {
        const plan = PLAN_LABELS[planName] ?? PLAN_LABELS.pro;
        const base = process.env.NEXTAUTH_URL || "https://www.smartlinkpilot.com";
        const invoiceUrl = `${base}/invoice/${invoice.token}`;
        const { subject, html } = invoiceReceiptEmailTemplate({
          name: user.name ?? user.email,
          email: user.email,
          invoiceNo: invoice.invoiceNo,
          planLabel: plan.label,
          planDescription: plan.description,
          amount: invoice.amount,
          currency: invoice.currency,
          trackingId: null,
          invoiceUrl,
          date: new Date(invoice.createdAt).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          }),
        });
        await sendEmail({ from: SENDERS.support, to: user.email, subject, html });
      }
    } catch (err) {
      console.error("[Mock Webhook] Invoice/email failed:", err);
    }

    return NextResponse.json({ success: true, role });
  } catch (error: any) {
    console.error("Mock Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
