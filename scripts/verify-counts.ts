import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const u = await p.user.count();
  const c = await p.category.count();
  const pr = await p.product.count();
  const img = await p.productImage.count();
  const fit = await p.fitment.count();
  const admin = await p.user.findFirst({ where: { role: "ADMIN" }, select: { email: true } });
  console.log(`RESULT user=${u} category=${c} product=${pr} image=${img} fitment=${fit} admin=${admin?.email ?? "YOK"}`);
  await p.$disconnect();
})();
