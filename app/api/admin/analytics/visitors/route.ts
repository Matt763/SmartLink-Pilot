import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getDateRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start = new Date(now);

  switch (period) {
    case "now":
      start.setMinutes(start.getMinutes() - 5); // last 5 min = "now"
      break;
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "2weeks":
      start.setDate(start.getDate() - 14);
      break;
    case "month":
      start.setDate(start.getDate() - 30);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    case "2years":
      start.setFullYear(start.getFullYear() - 2);
      break;
    default: // all time
      start = new Date("2024-01-01");
      break;
  }
  return { start, end };
}

function groupByKey<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const k = key(item) || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "today";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 25;
    const { start, end } = getDateRange(period);

    const where = period === "all" ? {} : { createdAt: { gte: start, lte: end } };

    const [sessions, totalCount, pageViews] = await Promise.all([
      prisma.visitorSession.findMany({
        where,
        include: { pageViews: { select: { path: true, duration: true, createdAt: true }, orderBy: { createdAt: "asc" } } },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.visitorSession.count({ where }),
      prisma.pageView.findMany({
        where: { createdAt: { gte: period === "all" ? new Date("2024-01-01") : start, lte: end } },
        select: { path: true, sessionId: true },
      }),
    ]);

    // Aggregations
    const allSessions = await prisma.visitorSession.findMany({
      where,
      select: { device: true, browser: true, os: true, country: true, source: true, duration: true },
    });

    const devices = groupByKey(allSessions, s => s.device || "desktop");
    const browsers = groupByKey(allSessions, s => s.browser || "Other");
    const countries = groupByKey(allSessions, s => s.country || "Unknown");
    const sources = groupByKey(allSessions, s => s.source || "Direct");

    const pageCounts = groupByKey(pageViews, p => p.path);
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, views]) => ({ path, views }));

    const totalDuration = allSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const avgDuration = allSessions.length > 0 ? Math.round(totalDuration / allSessions.length) : 0;

    // Daily chart data (last 30 days or period)
    const chartDays = period === "now" ? 0 : period === "today" ? 24 : 30;
    const chartData: { label: string; sessions: number; pageViews: number }[] = [];
    if (chartDays > 0 && chartDays <= 30) {
      for (let i = chartDays - 1; i >= 0; i--) {
        const d = new Date();
        if (chartDays === 24) {
          d.setMinutes(0, 0, 0); d.setHours(d.getHours() - i);
          const next = new Date(d); next.setHours(next.getHours() + 1);
          const [s, p] = await Promise.all([
            prisma.visitorSession.count({ where: { createdAt: { gte: d, lt: next } } }),
            prisma.pageView.count({ where: { createdAt: { gte: d, lt: next } } }),
          ]);
          chartData.push({ label: `${d.getHours()}:00`, sessions: s, pageViews: p });
        } else {
          d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
          const next = new Date(d); next.setDate(next.getDate() + 1);
          const [s, p] = await Promise.all([
            prisma.visitorSession.count({ where: { createdAt: { gte: d, lt: next } } }),
            prisma.pageView.count({ where: { createdAt: { gte: d, lt: next } } }),
          ]);
          chartData.push({ label: `${d.getDate()}/${d.getMonth()+1}`, sessions: s, pageViews: p });
        }
      }
    }

    return NextResponse.json({
      totalSessions: totalCount,
      totalPageViews: pageViews.length,
      avgDuration,
      devices,
      browsers,
      countries,
      sources,
      topPages,
      chartData,
      sessions: sessions.map(s => ({
        id: s.id,
        sessionId: s.sessionId,
        country: s.country || "Unknown",
        city: s.city || "",
        device: s.device || "desktop",
        browser: s.browser || "Other",
        os: s.os || "Other",
        source: s.source || "Direct",
        referrer: s.referrer || "",
        duration: s.duration || 0,
        pages: s.pageViews.map(p => p.path),
        pageCount: s.pageViews.length,
        createdAt: s.createdAt,
      })),
      pagination: { page, limit, total: totalCount, pages: Math.ceil(totalCount / limit) },
    });
  } catch (err: any) {
    console.error("[VISITORS_ANALYTICS]", err);
    return new NextResponse("Error", { status: 500 });
  }
}
