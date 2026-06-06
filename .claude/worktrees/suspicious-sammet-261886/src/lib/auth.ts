import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";

const useSecureCookies = (process.env.NEXTAUTH_URL ?? "").startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/giris",
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Aynı e-posta ile önceden credentials hesabı varsa Google ile girişte
      // otomatik bağlasın (OAuthAccountNotLinked hatasını engeller).
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // Rate limit: IP başına 15 dakikada en fazla 10 giriş denemesi
        const fwd = req?.headers?.["x-forwarded-for"];
        const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim()
          ?? (req?.headers?.["x-real-ip"] as string)
          ?? "anon";
        const rl = rateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
        if (!rl.ok) {
          throw new Error(`Çok fazla giriş denemesi. ${rl.retryAfterSec} saniye bekleyin.`);
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
      } else if (token.email && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      // Otomatik admin yükseltme: ADMIN_EMAIL ile eşleşen kullanıcı her giriş/yenilemede admin olur.
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
      if (
        adminEmail &&
        token.email?.toLowerCase() === adminEmail &&
        token.role !== "ADMIN"
      ) {
        if (token.id) {
          try {
            await prisma.user.update({
              where: { id: token.id },
              data: { role: "ADMIN" },
            });
          } catch (e) {
            console.error("[auth] admin promotion failed:", e);
          }
        }
        token.role = "ADMIN";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
