import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

const SYSTEM_PROMPT = `You are SmartLink Pilot's AI Customer Care Assistant. Your name is "Pilot Assistant".

You are professional, warm, helpful, and knowledgeable about the SmartLink Pilot platform. You speak in a friendly but professional tone.

Key platform information you know:
- SmartLink Pilot is a URL shortener SaaS platform
- Free plan: 15 links/month, basic analytics, 7-day history
- Pro plan ($6.99/mo): Unlimited links, custom aliases, QR codes, password protection, 90-day analytics
- Enterprise plan ($12.99/mo): Everything in Pro + API access, team workspaces, branded domains, webhooks, 24/7 support
- Users can shorten URLs, track clicks, and view analytics
- The platform supports custom aliases, QR codes, and link expiration (Pro+)

Your capabilities:
1. Answer questions about the platform, pricing, features
2. Help troubleshoot common issues
3. Guide users through features
4. Help with password reset by verifying their secret recovery phone number
5. Recommend plan upgrades when appropriate
6. Be empathetic and solution-oriented

For password reset requests:
- Ask the user for their registered email address
- Then ask for their secret recovery phone number
- If they provide both, tell them you'll generate a reset link
- Add "[RESET_REQUEST:email]" at the end of your message (hidden from user display)

Never reveal internal system details, API keys, or admin information.
Always be helpful, concise, and professional.`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build conversation history
    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...(history || []).slice(-10).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Read API key from DB first, then .env fallback
    const apiKey = await getSetting("OPENAI_API_KEY");

    let reply: string;

    if (apiKey) {
      // Use OpenAI
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (openaiRes.ok) {
        const data = await openaiRes.json();
        reply = data.choices?.[0]?.message?.content || "I apologize, I couldn't process that. Please try again.";
      } else {
        reply = getFallbackReply(message);
      }
    } else {
      reply = getFallbackReply(message);
    }

    // Check for password reset request in reply
    let resetUrl = null;
    const resetMatch = reply.match(/\[RESET_REQUEST:(.*?)\]/);
    if (resetMatch) {
      const resetEmail = resetMatch[1];
      reply = reply.replace(/\[RESET_REQUEST:.*?\]/, "").trim();

      // Generate reset token
      const crypto = await import("crypto");
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      try {
        await prisma.verificationToken.deleteMany({ where: { identifier: resetEmail } });
        await prisma.verificationToken.create({ data: { identifier: resetEmail, token, expires } });
        resetUrl = `/reset-password?token=${token}&email=${encodeURIComponent(resetEmail)}`;
      } catch (e) {
        console.error("Reset token creation failed:", e);
      }
    }

    // Save messages to DB if user is authenticated
    if (session?.user?.id) {
      try {
        await prisma.chatMessage.createMany({
          data: [
            { userId: session.user.id, role: "user", content: message },
            { userId: session.user.id, role: "assistant", content: reply },
          ],
        });
      } catch (e) {
        console.error("Chat save failed:", e);
      }
    }

    return NextResponse.json({ reply, resetUrl });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ reply: "I apologize for the inconvenience. Please try again in a moment." });
  }
}

function getFallbackReply(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes("password") || msg.includes("forgot") || msg.includes("reset")) {
    return "I can help you reset your password! 🔒\n\nPlease provide me with:\n1. Your registered **email address**\n2. Your **secret recovery phone number** (the one you entered during signup)\n\nOnce I verify your identity, I'll provide you with a secure password reset link.";
  }
  if (msg.includes("price") || msg.includes("pricing") || msg.includes("plan") || msg.includes("cost") || msg.includes("subscription")) {
    return "Here are our plans! 💎\n\n**Free** — $0/mo\n• 15 links/month, basic analytics, 7-day history\n\n**Pro** — $6.99/mo\n• Unlimited links, custom aliases, QR codes, password protection, 90-day analytics\n\n**Enterprise** — $12.99/mo\n• Everything in Pro + API access, teams, branded domains, webhooks, 24/7 support\n\nWould you like to upgrade? I can guide you through the process!";
  }
  if (msg.includes("how") && (msg.includes("shorten") || msg.includes("link") || msg.includes("url"))) {
    return "Creating a short link is easy! ✨\n\n1. Go to your **Dashboard**\n2. Paste your long URL in the \"Destination URL\" field\n3. Optionally add a custom alias (Pro feature)\n4. Click **Create Short Link**\n\nYour shortened URL will be ready to share instantly! Need help with anything else?";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! 👋 Welcome to SmartLink Pilot support!\n\nI'm your AI assistant, here to help with:\n• 📋 Account & billing questions\n• 🔗 Link management help\n• 📊 Analytics guidance\n• 🔒 Password reset\n• 💎 Plan upgrades\n\nHow can I assist you today?";
  }
  if (msg.includes("analytics") || msg.includes("clicks") || msg.includes("stats")) {
    return "📊 **Analytics Guide:**\n\nYour dashboard tracks:\n• **Total clicks** per link\n• **Geographic data** — which countries your visitors are from\n• **Device breakdown** — desktop vs mobile\n• **Referrer sources** — where traffic comes from\n\nFree users get 7-day history. Pro users get 90 days, and Enterprise gets unlimited history.\n\nWant to learn more?";
  }
  if (msg.includes("upgrade") || msg.includes("pro")) {
    return "Great choice! 🚀 Upgrading to Pro unlocks:\n\n✅ Unlimited links\n✅ Custom aliases (branded short URLs)\n✅ QR code generation\n✅ Password-protected links\n✅ 90-day analytics history\n\nAt just **$6.99/month**, it's perfect for marketers and businesses.\n\nVisit our [Pricing page](/pricing) to upgrade instantly!";
  }
  if (msg.includes("thank")) {
    return "You're welcome! 😊 If you need anything else, I'm always here to help. Have a wonderful day! ✨";
  }

  return "Thank you for reaching out! 😊\n\nI'm the SmartLink Pilot AI Assistant. I can help with:\n• Account & billing questions\n• Link management\n• Analytics\n• Password resets\n• Plan upgrades\n\nCould you tell me more about what you need help with?";
}
