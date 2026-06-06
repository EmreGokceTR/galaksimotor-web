import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings, st } from "@/lib/site-settings";
import { GarageClient } from "./GarageClient";

export const metadata = { title: "Garajım" };

export default async function GarajPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const [items, bag] = await Promise.all([
    prisma.userMotorcycle.findMany({
      where: { userId: session.user.id },
      include: { motorcycle: true },
      orderBy: { id: "asc" },
    }),
    getSettings([
      "garage_title",
      "garage_subtitle",
      "garage_empty",
      "garage_add_btn",
    ]),
  ]);

  return (
    <GarageClient
      bikes={items.map((it) => ({
        id: it.id,
        motorcycleId: it.motorcycleId,
        nickname: it.nickname,
        brand: it.motorcycle.brand,
        model: it.motorcycle.model,
        year: it.motorcycle.year,
      }))}
      settings={{
        title: st(bag, "garage_title", "Garajım"),
        subtitle: st(bag, "garage_subtitle", "Motorlarını ekle — sadece sana uygun parçaları gösterelim."),
        emptyText: st(bag, "garage_empty", "Henüz motor eklemedin."),
        addBtnLabel: st(bag, "garage_add_btn", "+ Motor Ekle"),
      }}
    />
  );
}
