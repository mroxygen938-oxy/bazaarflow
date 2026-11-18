import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (!ids.length) return NextResponse.json({ products: [] });

  const products = await db.product.findMany({
    where: { id: { in: ids } },
    include: {
      shop: { select: { name: true, location: true } },
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  const ordered = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  return NextResponse.json({
    products: ordered.map((p) => {
      let specs: Record<string, string> = {};
      try {
        specs = JSON.parse(p.specs ?? "{}");
      } catch {
        specs = {};
      }
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        oldPrice: p.oldPrice,
        image: p.image,
        rating: p.rating,
        reviewCount: p.reviewCount,
        stock: p.stock,
        brand: p.brand?.name ?? "—",
        category: p.category.name,
        seller: p.shop.name,
        location: p.shop.location,
        specs,
      };
    }),
  });
}
