import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const db = new PrismaClient();
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "bazaarflow-dev-secret-change-me");

const emails = ["admin@bazaarflow.com", "seller@bazaarflow.com", "customer@bazaarflow.com"];
const out = {};

for (const email of emails) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) continue;
  const token = await new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  out[user.role] = token;
}

const products = await db.product.findMany({ take: 2, select: { id: true, slug: true } });
console.log(JSON.stringify({ tokens: out, products }, null, 2));
await db.$disconnect();
