import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = { title: "Ödeme - Galaksi Motor" };

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris?callbackUrl=/odeme");
  }

  return (
    <CheckoutClient
      defaultName={session.user.name ?? ""}
      defaultEmail={session.user.email ?? ""}
    />
  );
}
