import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializePayment } from "@/lib/flutterwave";

const PLAN_CONFIG: Record<
  string,
  { amount: number; planId: string | undefined; description: string }
> = {
  pro: {
    amount: 6.99,
    planId: process.env.FLUTTERWAVE_PRO_PLAN_ID,
    description: "SmartLink Pilot Pro — Unlimited links, analytics & QR codes",
  },
  enterprise: {
    amount: 12.99,
    planId: process.env.FLUTTERWAVE_ENTERPRISE_PLAN_ID,
    description: "SmartLink Pilot Enterprise — Full API, team workspaces & more",
  },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planName } = await req.json();
    const plan = PLAN_CONFIG[planName as string] || PLAN_CONFIG.pro;
    const resolvedPlanName = PLAN_CONFIG[planName as string] ? planName : "pro";

    // Fall back to mock checkout when Flutterwave is not configured
    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      return NextResponse.json({
        url: `/mock-checkout?plan=${resolvedPlanName}`,
      });
    }

    const txRef = `slp_${session.user.id}_${Date.now()}`;

    const result = await initializePayment({
      txRef,
      amount: plan.amount,
      currency: "USD",
      email: session.user.email,
      name: session.user.name || session.user.email,
      planId: plan.planId,
      redirectUrl: `${process.env.NEXTAUTH_URL}/api/payment/verify`,
      meta: {
        userId: session.user.id,
        planName: resolvedPlanName,
        txRef,
      },
      description: plan.description,
    });

    if (result.status !== "success" || !result.data?.link) {
      console.error("Flutterwave init error:", result);
      return NextResponse.json(
        { error: result.message || "Could not create payment link" },
        { status: 500 }
      );
    }

    // Save pending subscription record
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, status: "pending" },
      update: { status: "pending" },
    });

    return NextResponse.json({ url: result.data.link });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
