import { prisma } from "@/lib/prisma";

export const PLAN_LABELS: Record<string, { label: string; amount: number; description: string }> = {
  pro:        { label: "SmartLink Pilot Pro",        amount: 6.99,  description: "Unlimited links · Custom aliases · QR codes · 90-day analytics" },
  enterprise: { label: "SmartLink Pilot Enterprise", amount: 12.99, description: "Full API access · Team workspaces · Branded domains · Webhooks · 24/7 support" },
};

/** Generate a sequential invoice number like SLP-2026-00001 */
export async function generateInvoiceNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const seq = String(count + 1).padStart(5, "0");
  return `SLP-${year}-${seq}`;
}

/** Create an Invoice record and return it */
export async function createInvoice(params: {
  userId: string;
  planName: string;
  trackingId?: string;
}) {
  const { userId, planName, trackingId } = params;
  const plan = PLAN_LABELS[planName] ?? PLAN_LABELS.pro;
  const invoiceNo = await generateInvoiceNo();

  return prisma.invoice.create({
    data: {
      invoiceNo,
      userId,
      planName,
      amount: plan.amount,
      currency: "USD",
      status: "paid",
      trackingId: trackingId ?? null,
    },
    include: { user: { select: { name: true, email: true, username: true } } },
  });
}
