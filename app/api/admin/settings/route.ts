import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllSettings, setSetting, EDITABLE_KEYS } from "@/lib/settings";
import bcrypt from "bcryptjs";

const CEO_EMAIL = "mclean@smartlinkpilot.com";

// GET: Load current settings (masked keys from DB + env)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // Get all editable keys with masked values and source
  let settings: Record<string, any> = {};
  try {
    settings = await getAllSettings();
  } catch {
    // DB may not be ready — return env-only fallback
    for (const key of EDITABLE_KEYS) {
      const val = process.env[key] || "";
      settings[key] = {
        value: val,
        masked: val ? val.slice(0, 7) + "•".repeat(Math.min(20, val.length - 11)) + val.slice(-4) : "",
        source: val ? "env" : "none",
      };
    }
  }

  // Account data (if logged in)
  let account = null;
  if (session?.user?.email) {
    try {
      account = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { name: true, email: true, username: true },
      });
    } catch {}
  }

  return NextResponse.json({ account, settings });
}

// POST: Update settings
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const body = await req.json();
  const { action } = body;

  try {
    switch (action) {
      case "update_account": {
        if (!session?.user?.email) {
          return NextResponse.json({ error: "Not logged in" }, { status: 401 });
        }
        const { name, email, newPassword, confirmPassword } = body;
        if (!name || !email) {
          return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }
        const updateData: any = { name, email };
        if (newPassword) {
          if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
          }
          if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
          }
          updateData.password = await bcrypt.hash(newPassword, 12);
        }
        await prisma.user.update({
          where: { email: session.user.email },
          data: updateData,
        });
        return NextResponse.json({ message: "Account updated successfully" });
      }

      case "update_key": {
        const { key, value } = body;
        if (!key || !EDITABLE_KEYS.includes(key)) {
          return NextResponse.json({ error: "Invalid key" }, { status: 400 });
        }
        if (!value || value.trim().length === 0) {
          return NextResponse.json({ error: "Value cannot be empty" }, { status: 400 });
        }
        await setSetting(key, value.trim());
        return NextResponse.json({ message: `${key} updated successfully` });
      }

      case "save_integrations": {
        // Batch update multiple keys
        const { keys } = body;
        if (!keys || typeof keys !== "object") {
          return NextResponse.json({ error: "No keys provided" }, { status: 400 });
        }
        let updated = 0;
        for (const [key, value] of Object.entries(keys)) {
          if (EDITABLE_KEYS.includes(key as any) && typeof value === "string" && value.trim()) {
            await setSetting(key, (value as string).trim());
            updated++;
          }
        }
        return NextResponse.json({ message: `${updated} setting(s) saved successfully` });
      }

      case "regenerate_api_key": {
        const crypto = await import("crypto");
        const newKey = "slp_sk_live_" + crypto.randomBytes(24).toString("hex");
        return NextResponse.json({ apiKey: newKey, message: "API key regenerated" });
      }

      case "reset_all_links": {
        const count = await prisma.url.deleteMany({});
        return NextResponse.json({ message: `${count.count} links deleted` });
      }

      case "purge_analytics": {
        const count = await prisma.click.deleteMany({});
        return NextResponse.json({ message: `${count.count} analytics records purged` });
      }

      case "export_data": {
        const users = await prisma.user.findMany({
          select: { id: true, name: true, email: true, username: true, role: true, createdAt: true },
        });
        const urls = await prisma.url.findMany({
          select: { id: true, shortCode: true, originalUrl: true, createdAt: true, userId: true },
        });
        return NextResponse.json({ users, urls, exportedAt: new Date().toISOString() });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Admin settings error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
