"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { initials, slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function approveSellerAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const shopName = user.requestedShopName?.trim() || `${user.name}'s Shop`;
  const existingShop = await db.shop.findFirst({ where: { ownerId: user.id } });

  if (!existingShop) {
    let slug = slugify(shopName) || "shop";
    const clash = await db.shop.findUnique({ where: { slug } });
    if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    await db.shop.create({
      data: {
        slug,
        name: shopName,
        tagline: "Newly approved marketplace seller",
        description: `${shopName} is a newly approved BAZAARFLOW seller, verified by the admin team.`,
        initials: initials(shopName) || "BF",
        location: "Dhaka, Bangladesh",
        ownerId: user.id,
        verified: true,
        rating: 5,
      },
    });
  }

  await db.user.update({
    where: { id: user.id },
    data: { role: "SELLER", sellerStatus: "APPROVED" },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      title: "Seller application approved",
      body: `Congratulations! Your shop “${shopName}” is approved. Open your seller dashboard to list products.`,
      kind: "seller",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/seller");
  revalidatePath("/account");
  revalidatePath("/explore");
}

export async function rejectSellerAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await db.user.update({
    where: { id: user.id },
    data: { role: "CUSTOMER", sellerStatus: "REJECTED" },
  });

  await db.notification.create({
    data: {
      userId: user.id,
      title: "Seller application declined",
      body: "Your request to sell on BAZAARFLOW was not approved. Your account remains a normal customer account.",
      kind: "seller",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/seller");
  revalidatePath("/account");
}
