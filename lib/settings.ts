import { prisma } from "@/lib/prisma";

// Keys that can be managed via Admin CMS
export const EDITABLE_KEYS = [
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "GOOGLE_ANALYTICS_ID",
] as const;

export type EditableKey = (typeof EDITABLE_KEYS)[number];

/**
 * Get a setting value. Priority: DB → .env
 * This ensures admin edits in the DB override .env defaults,
 * and .env values work as fallbacks (especially for Vercel env vars).
 */
export async function getSetting(key: string): Promise<string> {
  try {
    const dbSetting = await prisma.siteSetting.findUnique({ where: { key } });
    if (dbSetting?.value) return dbSetting.value;
  } catch {
    // DB not available — fall back to env
  }
  return process.env[key] || "";
}

/**
 * Set a setting value in the DB.
 * On Vercel, .env is read-only, so we persist edits in the database.
 * The getSetting() function checks DB first, so edits take effect immediately.
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/**
 * Get all editable settings with their current values (masked for display).
 */
export async function getAllSettings(): Promise<
  Record<string, { value: string; masked: string; source: "db" | "env" | "none" }>
> {
  const result: Record<string, { value: string; masked: string; source: "db" | "env" | "none" }> = {};

  for (const key of EDITABLE_KEYS) {
    let value = "";
    let source: "db" | "env" | "none" = "none";

    try {
      const dbSetting = await prisma.siteSetting.findUnique({ where: { key } });
      if (dbSetting?.value) {
        value = dbSetting.value;
        source = "db";
      }
    } catch {}

    if (!value && process.env[key]) {
      value = process.env[key]!;
      source = "env";
    }

    result[key] = {
      value,
      masked: value ? maskKey(value) : "",
      source,
    };
  }

  return result;
}

function maskKey(val: string): string {
  if (val.length <= 10) return "•".repeat(val.length);
  return val.slice(0, 7) + "•".repeat(Math.min(20, val.length - 11)) + val.slice(-4);
}
