import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

/**
 * NextAuth'un kullandığı format ile uyumlu CSRF token üretir.
 * Server-side render sırasında HTML form'a gömeriz — istemcide JS
 * yüklenmese bile Google butonu çalışsın diye.
 */
async function getCsrfToken(): Promise<string> {
  try {
    const h = headers();
    const host = h.get("host") ?? "galaksimotor.com";
    const proto = h.get("x-forwarded-proto") ?? "https";
    const cookie = h.get("cookie") ?? "";
    const res = await fetch(`${proto}://${host}/api/auth/csrf`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { csrfToken?: string };
    return data.csrfToken ?? "";
  } catch {
    return "";
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(searchParams.callbackUrl || "/");
  }
  const csrfToken = await getCsrfToken();
  const callbackUrl = searchParams.callbackUrl || "/";
  return <LoginClient csrfToken={csrfToken} callbackUrl={callbackUrl} />;
}
