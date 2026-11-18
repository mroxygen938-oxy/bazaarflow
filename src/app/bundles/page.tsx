import { db } from "@/lib/db";
import { BundleBuilder, type BuilderProduct, type BuilderTemplate } from "@/components/bundles/bundle-builder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Smart Bundle Builder" };

export default async function BundlesPage() {
  const [products, bundles, categories] = await Promise.all([
    db.product.findMany({
      include: {
        shop: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { price: "asc" },
    }),
    db.bundle.findMany({ orderBy: { createdAt: "asc" } }),
    db.category.findMany(),
  ]);

  const builderProducts: BuilderProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    image: p.image,
    shopName: p.shop.name,
    categorySlug: p.category.slug,
    categoryName: p.category.name,
    stock: p.stock,
    rating: p.rating,
  }));

  const templates: BuilderTemplate[] = bundles.map((b) => ({
    slug: b.slug,
    name: b.name,
    kind: b.kind,
    tagline: b.tagline,
    price: b.price,
    oldPrice: b.oldPrice,
    accent: b.accent,
    items: JSON.parse(b.items) as BuilderTemplate["items"],
  }));

  return (
    <BundleBuilder
      products={builderProducts}
      templates={templates}
      categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))}
    />
  );
}
