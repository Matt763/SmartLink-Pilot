import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function periodStart(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "today": { const d = new Date(now); d.setHours(0,0,0,0); return d; }
    case "yesterday": { const d = new Date(now); d.setDate(d.getDate()-1); d.setHours(0,0,0,0); return d; }
    case "week": { const d = new Date(now); d.setDate(d.getDate()-7); return d; }
    case "month": { const d = new Date(now); d.setDate(d.getDate()-30); return d; }
    case "year": { const d = new Date(now); d.setFullYear(d.getFullYear()-1); return d; }
    default: return null;
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") return new NextResponse("Unauthorized", { status: 401 });

    const [totalUsers, totalLinks, totalClicks, activeSubscriptions, freeUsers, proUsers, enterpriseUsers, recentUsers, recentLinks] = await Promise.all([
      prisma.user.count(),
      prisma.url.count(),
      prisma.click.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.user.count({ where: { role: "free_user" } }),
      prisma.user.count({ where: { role: "premium_user" } }),
      prisma.user.count({ where: { role: "enterprise_user" } }),
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.url.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, shortCode: true, originalUrl: true, createdAt: true, userId: true } }),
    ]);

    // Revenue estimate
    const mrr = (proUsers * 6.99) + (enterpriseUsers * 12.99);

    // Month-over-month user growth
    const lastMonthStart = new Date(); lastMonthStart.setDate(lastMonthStart.getDate() - 30);
    const twoMonthsStart = new Date(); twoMonthsStart.setDate(twoMonthsStart.getDate() - 60);
    const [thisMonthUsers, lastMonthUsers] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: lastMonthStart } } }),
      prisma.user.count({ where: { createdAt: { gte: twoMonthsStart, lt: lastMonthStart } } }),
    ]);
    const userGrowth = lastMonthUsers > 0 ? Math.round(((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100) : 0;

    // Monthly revenue trend (last 12 months)
    const revenueTrend: { month: string; val: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const [p, e] = await Promise.all([
        prisma.user.count({ where: { role: "premium_user", createdAt: { lte: end } } }),
        prisma.user.count({ where: { role: "enterprise_user", createdAt: { lte: end } } }),
      ]);
      revenueTrend.push({
        month: d.toLocaleString("default", { month: "short" }),
        val: Math.round((p * 6.99) + (e * 12.99)),
      });
    }

    // Recent subscriptions as activity feed
    const recentSubs = await prisma.subscription.findMany({
      where: { status: "active" },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { user: { select: { email: true, role: true } } },
    });

    const recentActivity = [
      ...recentUsers.map(u => ({ type: "signup", text: `New signup: ${u.email}`, time: u.createdAt })),
      ...recentLinks.map(l => ({ type: "link", text: `New short link created: /${l.shortCode}`, time: l.createdAt })),
      ...recentSubs.map(s => ({ type: "upgrade", text: `Plan activated: ${s.user?.email} → ${s.user?.role === "enterprise_user" ? "Enterprise" : "Pro"}`, time: s.updatedAt })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return NextResponse.json({
      totalUsers, totalLinks, totalClicks, mrr: Math.round(mrr * 100) / 100,
      userGrowth, activeSubscriptions,
      breakdown: { free: freeUsers, pro: proUsers, enterprise: enterpriseUsers },
      revenueTrend,
      recentActivity,
    });
  } catch (err: any) {
    console.error("[ADMIN_STATS]", err);
    return new NextResponse("Error", { status: 500 });
  }
}
