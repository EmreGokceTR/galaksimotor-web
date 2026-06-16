import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(searchParams.callbackUrl || "/");
  }
  return <LoginClient callbackUrl={searchParams.callbackUrl || "/"} />;
}
