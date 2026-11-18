"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeTotals, resolveCoupon } from "@/lib/pricing";

export type PlaceOrderItem = { productId: string; quantity: number };

export type PlaceOrderInput = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  city: string;
  note?: string;
  shippingMethod: "standard" | "express" | "pickup";
  paymentMethod: "COD" | "BKASH" | "NAGAD" | "CARD";
  couponCode?: string;
  items: PlaceOrderItem[];
};

export type PlaceOrderResult =
  | { ok: true; orderNo: string }
  | { ok: false; error: string };

const EXPRESS_FEE = 250;

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  if (!input.items?.length) return { ok: false, error: "Your bag is empty." };
  if (!input.customerName?.trim()) return { ok: false, error: "Enter your full name." };
  if (!/^\+?[0-9\s-]{6,}$/.test(input.phone ?? "")) return { ok: false, error: "Enter a valid phone number." };
  if (!input.address?.trim()) return { ok: false, error: "Enter your delivery address." };
  if (!input.city?.trim()) return { ok: false, error: "Enter your city." };

  const ids = input.items.map((i) => i.productId).filter(Boolean);
  const products = await db.product.findMany({ where: { id: { in: ids } } });
  if (products.length === 0) return { ok: false, error: "Those products are no longer available." };

  const lineItems = input.items
    .map((it) => {
      const product = products.find((p) => p.id === it.productId);
      if (!product) return null;
      const quantity = Math.max(1, Math.min(99, Math.floor(it.quantity)));
      return {
        product,
        quantity,
        price: product.price,
      };
    })
    .filter((v): v is { product: (typeof products)[number]; quantity: number; price: number } => v !== null);

  if (lineItems.length === 0) return { ok: false, error: "Your selected products are unavailable." };

  const subtotal = lineItems.reduce((a, b) => a + b.price * b.quantity, 0);
  const coupon = resolveCoupon(subtotal, input.couponCode ?? "");
  const base = computeTotals(subtotal, coupon.discount);
  let delivery = base.delivery;
  if (input.shippingMethod === "express") delivery = EXPRESS_FEE;
  if (input.shippingMethod === "pickup") delivery = 0;
  const total = Math.max(0, subtotal - base.discount) + delivery;

  const session = await getSession();
  const orderNo = `BF-${Date.now().toString().slice(-6)}`;

  const order = await db.order.create({
    data: {
      orderNo,
      userId: session?.id ?? null,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      address: `${input.address.trim()}${input.area ? `, ${input.area.trim()}` : ""}, ${input.city.trim()}`,
      city: input.city.trim(),
      subtotal,
      deliveryFee: delivery,
      discount: base.discount,
      total,
      paymentMethod: input.paymentMethod,
      status: "PENDING",
      note: input.note?.trim() || null,
      items: {
        create: lineItems.map((li) => ({
          productId: li.product.id,
          name: li.product.name,
          image: li.product.image,
          price: li.price,
          quantity: li.quantity,
        })),
      },
    },
  });

  for (const li of lineItems) {
    await db.product.update({
      where: { id: li.product.id },
      data: { stock: Math.max(0, li.product.stock - li.quantity) },
    });
  }

  if (session?.id) {
    await db.notification.create({
      data: {
        userId: session.id,
        title: `Order ${orderNo} placed`,
        body: `We received your order of ${lineItems.length} item(s). Escrow protection is active.`,
        kind: "order",
      },
    });
  }

  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/seller");

  void order;
  return { ok: true, orderNo };
}
