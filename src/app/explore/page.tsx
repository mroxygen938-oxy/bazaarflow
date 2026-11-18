import { db } from "@/lib/db";
import { toCard } from "@/lib/product-view";
import type { ProductCardData } from "@/components/product/product-card";
import { ExploreClient, type ExploreProduct } from "@/components/explore/explore-client";

export const dynamic = "force-dynamic";

export const metadata = { title: "Explore Marketplace" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initialCategory = typeof sp.category === "string" ? sp.category : "all";
  const initialShop = typeof sp.shop === "string" ? sp.shop : "all";
  const initialQuery = typeof sp.q === "string" ? sp.q : "";

  const [products, categories, brands, shops] = await Promise.all([
    db.product.findMany({
      include: {
        shop: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany(),
    db.brand.findMany({ orderBy: { name: "asc" } }),
    db.shop.findMany({ orderBy: { name: "asc" } }),
  ]);

  const mapped: ExploreProduct[] = products.map((p) => {
    const card = toCard(p) as ProductCardData;
    return {
      ...card,
      categorySlug: p.category.slug,
      categoryName: p.category.name,
      brandSlug: p.brand?.slug ?? "",
      brandName: p.brand?.name ?? "",
      shopSlug: p.shop.slug,
    };
  });

  return (
    <ExploreClient
      products={mapped}
      categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))}
      brands={brands.map((b) => ({ slug: b.slug, name: b.name }))}
      shops={shops.map((s) => ({ slug: s.slug, name: s.name }))}
      initialCategory={initialCategory}
      initialShop={initialShop}
      initialQuery={initialQuery}
    />
  );
}
