import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfDay, format, subDays } from "date-fns";

export async function GET(
  req: Request,
  { params }: { params: { shortCode: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = await prisma.url.findUnique({
      where: { shortCode: params.shortCode },
      include: {
        clicks: true,
      },
    });

    if (!url || (url.userId !== session.user.id && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
    }

    // Chart 1: Clicks over last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), i);
      return {
        date: format(d, "MMM dd"),
        clicks: 0,
        rawDate: startOfDay(d).getTime()
      };
    }).reverse();

    // Chart 2: Browsers & OS
    const devices: Record<string, number> = {};
    const countries: Record<string, number> = {};

    url.clicks.forEach(click => {
      const clickDate = startOfDay(new Date(click.createdAt)).getTime();
      const dayData = last7Days.find(d => d.rawDate === clickDate);
      if (dayData) dayData.clicks++;

      const d = click.device || "Unknown";
      devices[d] = (devices[d] || 0) + 1;

      const c = click.country || "Unknown";
      countries[c] = (countries[c] || 0) + 1;
    });

    const deviceData = Object.keys(devices).map(name => ({ name, value: devices[name] }));
    const countryData = Object.keys(countries).map(name => ({ name, value: countries[name] }));

    return NextResponse.json({
      url,
      timeSeries: last7Days,
      devices: deviceData,
      countries: countryData,
      totalClicks: url.clicks.length
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
