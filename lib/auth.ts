import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";
import { sendEmail, SENDERS } from "@/lib/resend";
import { welcomeEmailTemplate } from "@/lib/email-templates";

const CEO_EMAIL = "mclean@smartlinkpilot.com";

function generateUsername(name: string, email: string): string {
  const base = name
    ? name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20)
    : email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
  return base || "user";
}

async function getUniqueUsername(base: string): Promise<string> {
  let candidate = base;
  let suffix = 0;
  while (true) {
    const exists = await prisma.user.findUnique({ where: { username: candidate } });
    if (!exists) return candidate;
    suffix++;
    candidate = `${base}${suffix}`;
  }
}

// Wrap PrismaAdapter to inject username + role when Google creates a new user
function buildAdapter(): Adapter {
  const base = PrismaAdapter(prisma) as Adapter;
  return {
    ...base,
    createUser: async (data: any) => {
      const role = data.email === CEO_EMAIL ? "admin" : "free_user";
      const baseUsername =
        data.email === CEO_EMAIL
          ? "mcleanmbaga"
          : generateUsername(data.name || "", data.email || "");
      const username = await getUniqueUsername(baseUsername);

      const user = await prisma.user.create({
        data: { ...data, username, role },
      });

      // Send welcome email + subscribe to newsletter for all new non-CEO users
      if (user.email && user.email !== CEO_EMAIL) {
        try {
          const { subject, html } = welcomeEmailTemplate(user.name ?? username, username);
          await sendEmail({
            from: SENDERS.founder,
            to: user.email,
            subject,
            html,
            replyTo: "support@smartlinkpilot.com",
          });
        } catch (err) {
          console.error("[Auth] Google welcome email failed:", err);
        }

        try {
          await prisma.newsletterSubscriber.upsert({
            where: { email: user.email },
            update: { subscribed: true, name: user.name ?? undefined },
            create: { email: user.email, name: user.name ?? undefined },
          });
        } catch (err) {
          console.error("[Auth] Google newsletter subscribe failed:", err);
        }
      }

      return user;
    },
  };
}

export const authOptions: NextAuthOptions = {
  adapter: buildAdapter(),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Allow linking Google to an existing credentials account with the same email
      allowDangerousEmailAccountLinking: true,
    }),

    // ── Native Google Sign-In (Capacitor Android/iOS) ──────────────────────
    // Receives the idToken from the native Google Sign-In SDK and verifies it
    // server-side with Google's tokeninfo endpoint.  No browser or redirect
    // flow — the entire auth happens inside the app.
    CredentialsProvider({
      id: "google-native",
      name: "Google (Native)",
      credentials: {
        idToken: { label: "Google ID Token", type: "text" },
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken;
        if (!idToken) return null;

        // Verify the token with Google's public endpoint
        const tokenRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
        );
        if (!tokenRes.ok) return null;

        const payload = await tokenRes.json();

        // Validate audience — must match our Web OAuth client ID
        const validAudiences = [
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_ANDROID_CLIENT_ID, // optional Android client ID
        ].filter(Boolean);

        if (!validAudiences.includes(payload.aud)) {
          console.error("[google-native] idToken audience mismatch:", payload.aud);
          return null;
        }

        if (!payload.email_verified || !payload.email) return null;

        // Find or create user — mirrors the buildAdapter createUser logic
        let user = await prisma.user.findUnique({ where: { email: payload.email } });

        if (!user) {
          const role = payload.email === CEO_EMAIL ? "admin" : "free_user";
          const baseUsername = payload.email === CEO_EMAIL
            ? "mcleanmbaga"
            : generateUsername(payload.name || "", payload.email);
          const username = await getUniqueUsername(baseUsername);

          user = await prisma.user.create({
            data: {
              email: payload.email,
              name: payload.name ?? null,
              image: payload.picture ?? null,
              username,
              role,
              emailVerified: new Date(),
            },
          });

          // Welcome email + newsletter for new users (non-CEO)
          if (user.email !== CEO_EMAIL) {
            try {
              const { subject, html } = welcomeEmailTemplate(user.name ?? username, username);
              await sendEmail({
                from: SENDERS.founder,
                to: user.email!,
                subject,
                html,
                replyTo: "support@smartlinkpilot.com",
              });
            } catch (err) {
              console.error("[google-native] Welcome email failed:", err);
            }
            try {
              await prisma.newsletterSubscriber.upsert({
                where: { email: user.email! },
                update: { subscribed: true, name: user.name ?? undefined },
                create: { email: user.email!, name: user.name ?? undefined },
              });
            } catch (err) {
              console.error("[google-native] Newsletter subscribe failed:", err);
            }
          }
        } else {
          // Update avatar from Google if user hasn't set a custom one
          if (!user.image && payload.picture) {
            await prisma.user.update({
              where: { id: user.id },
              data: { image: payload.picture, emailVerified: new Date() },
            });
            user = { ...user, image: payload.picture };
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        let role = user.role;
        if (user.email === CEO_EMAIL && role !== "admin") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "admin" },
          });
          role = "admin";
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // First sign-in: user object is present
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "free_user";
        token.image = (user as any).image ?? null;
      }

      // Google OAuth or native first sign-in: fetch full profile from DB
      if ((account?.provider === "google" || account?.provider === "google-native") && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, username: true, image: true, name: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.username = dbUser.username;
          // Prefer Google avatar over any stored image
          token.image = token.image || dbUser.image;
        }
      }

      // Always enforce admin role for CEO
      if (token.email === CEO_EMAIL) {
        token.role = "admin";
      }

      if (trigger === "update") {
        if (session?.name)  token.name  = session.name;
        if (session?.image) token.image = session.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // Populate Google profile image into session
        if (token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
  },

  events: {
    // Ensure CEO always has admin role in DB after any sign-in
    async signIn({ user }) {
      if (user.email === CEO_EMAIL) {
        await prisma.user
          .update({ where: { id: user.id }, data: { role: "admin" } })
          .catch(() => {});
      }
    },
  },
};
