"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type ActionState = { error?: string; success?: string } | null;

const DEFAULT_PRODUCT_IMAGE = "/images/product-placeholder.svg";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

type ImageResult = { path: string } | { error: string };

async function persistImage(
  file: FormDataEntryValue | null,
  current = DEFAULT_PRODUCT_IMAGE,
): Promise<ImageResult> {
  if (!(file instanceof File) || file.size === 0) return { path: current };
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { error: "Please upload a JPG, PNG, WebP, GIF or AVIF image." };
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Product image must be 5 MB or smaller." };
  }
  const dir = join(process.cwd(), "storage", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await writeFile(join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return { path: `/api/uploads/${filename}` };
}

async function resolveBrandId(brandName: string) {
  if (!brandName) return null;
  const bslug = slugify(brandName) || "brand";
  const existing = await db.brand.findUnique({ where: { slug: bslug } });
  const brand =
    existing ?? (await db.brand.create({ data: { slug: bslug, name: brandName } }));
  return brand.id;
}

function readProductFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    oldPrice: Number(formData.get("oldPrice") ?? 0),
    stock: Number(formData.get("stock") ?? 0),
    categoryId: String(formData.get("categoryId") ?? ""),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    brandName: String(formData.get("brandName") ?? "").trim(),
    warranty:
      String(formData.get("warranty") ?? "").trim() || "12-month warranty",
  };
}

export async function createProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in as a seller." };

  const shop =
    (await db.shop.findFirst({ where: { ownerId: session.id } })) ??
    (session.role === "ADMIN" ? await db.shop.findFirst() : null);
  if (!shop) return { error: "You need a shop before adding products." };

  const fields = readProductFields(formData);
  const { name, price, oldPrice, stock, categoryId, subtitle, description, brandName, warranty } =
    fields;

  if (name.length < 3) return { error: "Product name is too short." };
  if (!price || price <= 0) return { error: "Enter a valid price." };
  if (!categoryId) return { error: "Select a category." };

  const saved = await persistImage(formData.get("image"));
  if ("error" in saved) return { error: saved.error };
  const image = saved.path;

  const brandId = await resolveBrandId(brandName);
  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;

  await db.product.create({
    data: {
      name,
      slug,
      subtitle: subtitle || null,
      description: description || null,
      price: Math.round(price),
      oldPrice: oldPrice > price ? Math.round(oldPrice) : null,
      stock: Math.max(0, Math.round(stock)),
      image,
      gallery: JSON.stringify([image]),
      specs: JSON.stringify({
        Brand: brandName || "BAZAARFLOW",
        Warranty: warranty,
      }),
      categoryId,
      shopId: shop.id,
      brandId,
      badge: "NEW ARRIVAL",
      trending: true,
    },
  });

  revalidatePath("/seller");
  revalidatePath("/explore");
  return { success: `${name} published to your shop.` };
}

export async function updateProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in as a seller." };

  const shop =
    (await db.shop.findFirst({ where: { ownerId: session.id } })) ??
    (session.role === "ADMIN" ? await db.shop.findFirst() : null);
  if (!shop) return { error: "No shop found for this account." };

  const productId = String(formData.get("productId") ?? "");
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Product not found." };
  if (product.shopId !== shop.id && session.role !== "ADMIN") {
    return { error: "You can only edit products from your own shop." };
  }

  const fields = readProductFields(formData);
  const { name, price, oldPrice, stock, categoryId, subtitle, description, brandName, warranty } =
    fields;

  if (name.length < 3) return { error: "Product name is too short." };
  if (!price || price <= 0) return { error: "Enter a valid price." };
  if (!categoryId) return { error: "Select a category." };

  const saved = await persistImage(formData.get("image"), product.image);
  if ("error" in saved) return { error: saved.error };
  const image = saved.path;

  const brandId = await resolveBrandId(brandName);

  await db.product.update({
    where: { id: product.id },
    data: {
      name,
      subtitle: subtitle || null,
      description: description || null,
      price: Math.round(price),
      oldPrice: oldPrice > price ? Math.round(oldPrice) : null,
      stock: Math.max(0, Math.round(stock)),
      image,
      gallery: JSON.stringify([image]),
      specs: JSON.stringify({
        Brand: brandName || "BAZAARFLOW",
        Warranty: warranty,
      }),
      categoryId,
      brandId,
    },
  });

  revalidatePath("/seller");
  revalidatePath("/explore");
  revalidatePath(`/product/${product.slug}`);
  return { success: `${name} updated successfully.` };
}

export async function updateOrderStatusAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!orderId || !allowed.includes(status)) return;

  await db.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/seller");
  revalidatePath("/admin");
  revalidatePath("/account");
}

export async function updateShopAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in." };
  const shop = await db.shop.findFirst({ where: { ownerId: session.id } });
  if (!shop) return { error: "No shop found for this account." };

  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  if (name.length < 2) return { error: "Shop name is too short." };

  await db.shop.update({
    where: { id: shop.id },
    data: { name, tagline: tagline || null, location: location || shop.location },
  });
  revalidatePath("/seller");
  return { success: "Shop profile updated." };
}
