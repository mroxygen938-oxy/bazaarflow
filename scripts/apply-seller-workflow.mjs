import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const password = await bcrypt.hash("password123", 10);

const seller = await db.user.findUnique({ where: { email: "seller@bazaarflow.com" } });
if (seller) {
  await db.user.update({
    where: { id: seller.id },
    data: { role: "SELLER", sellerStatus: "APPROVED", requestedShopName: "TechMatrix BD" },
  });
  console.log("seller@ marked APPROVED");
}

const admin = await db.user.findUnique({ where: { email: "admin@bazaarflow.com" } });

const pending = [
  { email: "rifat@bazaarflow.com", name: "Rifat Ahmed", shop: "Nexus Gadgets", phone: "+8801711000004", hours: 2 },
  { email: "nusrat@bazaarflow.com", name: "Nusrat Jahan", shop: "Aura Living", phone: "+8801711000005", hours: 30 },
];

for (const p of pending) {
  const existing = await db.user.findUnique({ where: { email: p.email } });
  if (existing) {
    console.log(`${p.email} already exists`);
    continue;
  }
  await db.user.create({
    data: {
      email: p.email,
      name: p.name,
      passwordHash: password,
      role: "CUSTOMER",
      sellerStatus: "PENDING",
      sellerRequestedAt: new Date(Date.now() - p.hours * 3600000),
      requestedShopName: p.shop,
      phone: p.phone,
    },
  });
  if (admin) {
    await db.notification.create({
      data: {
        userId: admin.id,
        title: "New seller application",
        body: `${p.name} applied to sell under “${p.shop}”. Review the request in the admin console.`,
        kind: "seller",
      },
    });
  }
  console.log(`created pending seller ${p.email}`);
}

await db.$disconnect();
