import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

const CEO_EMAIL = "mclean@smartlinkpilot.com";
const TEAM_DOMAIN = "smartlinkpilot.com";

const BLOCKED_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwaway.email",
  "yopmail.com", "sharklasers.com", "guerrillamailblock.com", "grr.la",
  "dispostable.com", "trashmail.com", "fakeinbox.com", "10minutemail.com",
  "tempail.com", "burnermail.io", "maildrop.cc", "temp-mail.org",
  "getnada.com", "emailondeck.com", "mohmal.com", "minutemail.com",
];

// Known-good email providers — skip DNS check for these
const TRUSTED_DOMAINS = [
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.co.in", "icloud.com", "me.com",
  "aol.com", "protonmail.com", "proton.me", "zoho.com", "mail.com",
  "gmx.com", "gmx.net", "yandex.com", "tutanota.com", "fastmail.com",
];

async function isEmailDomainValid(email: string): Promise<{ valid: boolean; reason?: string }> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return { valid: false, reason: "Invalid email format" };
  if (domain === TEAM_DOMAIN) return { valid: true };
  if (BLOCKED_DOMAINS.includes(domain)) return { valid: false, reason: "Disposable email addresses are not allowed. Please use a real email." };
  // Trusted domains — no DNS check needed
  if (TRUSTED_DOMAINS.includes(domain)) return { valid: true };
  try {
    const mx = await resolveMx(domain);
    if (!mx || mx.length === 0) return { valid: false, reason: "This email domain cannot receive emails." };
    return { valid: true };
  } catch {
    // DNS lookup failed — allow through (fail-open for real domains)
    return { valid: true };
  }
}

function generateUsername(name: string, email: string): string {
  const base = name
    ? name.toLowerCase().replace(/[^a-z0-9]/g, "")
    : email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  return base || "user";
}

export async function POST(req: Request) {
  try {
    const { email, password, name, username, secretPhone } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (!secretPhone) {
      return NextResponse.json({ error: "Recovery phone number is required" }, { status: 400 });
    }

    // Validate email domain
    const emailCheck = await isEmailDomainValid(email);
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.reason }, { status: 400 });
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Generate unique username
    let finalUsername = username
      ? username.toLowerCase().replace(/[^a-z0-9_]/g, "")
      : generateUsername(name || "", email);

    // CEO always gets @mcleanmbaga
    if (email === CEO_EMAIL) {
      finalUsername = "mcleanmbaga";
    }

    // Ensure username uniqueness
    let suffix = 0;
    let candidate = finalUsername;
    while (true) {
      const exists = await prisma.user.findUnique({ where: { username: candidate } });
      if (!exists) break;
      suffix++;
      candidate = `${finalUsername}${suffix}`;
    }
    finalUsername = candidate;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        username: finalUsername,
        secretPhone,
        password: hashedPassword,
        role: email === CEO_EMAIL ? "admin" : "free_user",
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id, username: finalUsername },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
