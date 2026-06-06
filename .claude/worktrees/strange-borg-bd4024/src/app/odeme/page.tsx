import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheckoutClient } from "./CheckoutClient";
import { getShippingConfig } from "@/lib/shipping";
import { isIyzicoConfigured } from "@/lib/iyzico";
import { buildPageMetadata } from "@/lib/page-meta";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("/odeme", {
    title: "Ödeme - Galaksi Motor",
    description: "Sipariş bilgilerinizi tamamlayın ve güvenle ödeme yapın.",
  });
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris?callbackUrl=/odeme");
  }

  const shipping = await getShippingConfig();

  return (
    <CheckoutClient
      defaultName={session.user.name ?? ""}
      defaultEmail={session.user.email ?? ""}
      shipping={shipping}
      iyzicoEnabled={isIyzicoConfigured}
    />
  );
}
