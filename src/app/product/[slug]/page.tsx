import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { productInclude, toCard } from "@/lib/product-view";
import { formatBDT } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Badge, Price, Rating, SectionHeading } from "@/components/ui/misc";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug }, select: { name: true, subtitle: true } });
  return { title: p?.name ?? "Product", description: p?.subtitle ?? undefined };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      shop: true,
      category: true,
      brand: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    include: productInclude,
    take: 4,
  });

  const gallery: string[] = (() => {
    try {
      const parsed = JSON.parse(product.gallery ?? "[]") as string[];
      return [product.image, ...parsed].filter(Boolean);
    } catch {
      return [product.image];
    }
  })();

  const specs: Record<string, string> = (() => {
    try {
      return JSON.parse(product.specs ?? "{}");
    } catch {
      return {};
    }
  })();

  const savings = product.oldPrice ? product.oldPrice - product.price : null;
  const off = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const lite = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.image,
    rating: product.rating,
    shopName: product.shop.name,
    category: product.category.name,
  };

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length
      : product.rating;

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <Icon name="chevron_right" className="text-sm" />
        <Link href="/explore" className="hover:text-ink">Explore</Link>
        <Icon name="chevron_right" className="text-sm" />
        <Link href={`/explore?category=${product.category.slug}`} className="hover:text-ink">
          {product.category.name}
        </Link>
        <Icon name="chevron_right" className="text-sm" />
        <span className="line-clamp-1 text-ink">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={gallery} alt={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge && <Badge tone="primary">{product.badge}</Badge>}
            <span className="chip bg-high text-muted">{product.brand?.name ?? "BAZAARFLOW"}</span>
            <span className="chip bg-high text-muted">{product.category.name}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-ink lg:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted">{product.subtitle}</p>

          <div className="mt-3 flex items-center gap-3">
            <Rating value={avgRating} count={product.reviewCount} size="md" />
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-secondary">Verified reviews</span>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <Price value={product.price} oldPrice={product.oldPrice} size="lg" />
            {off && <Badge tone="tertiary">-{off}% OFF</Badge>}
            {savings && (
              <span className="text-sm font-semibold text-tertiary">
                Save {formatBDT(savings)}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {product.stock > 0 ? (
              <span className="chip bg-secondary/15 text-secondary">
                <Icon name="check_circle" className="text-sm" />
                In stock · {product.stock} units
              </span>
            ) : (
              <span className="chip bg-danger/15 text-danger">Out of stock</span>
            )}
            <span className="chip bg-high text-muted">
              <Icon name="local_shipping" className="text-sm" />
              Dhaka same-day
            </span>
            <span className="chip bg-high text-muted">
              <Icon name="workspace_premium" className="text-sm" />
              Official warranty
            </span>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted">
            {product.description ??
              `The ${product.name} is curated by ${product.shop.name} and shipped through BAZAARFLOW's escrow-protected logistics. Every unit is serial-verified and backed by a zero-counterfeit pledge, with dedicated concierge support for setup and after-sales care across Bangladesh.`}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {Object.entries(specs).slice(0, 4).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-surface px-3 py-2">
                <span className="block text-[10px] uppercase tracking-wider text-muted">{k}</span>
                <span className="text-xs font-medium text-ink">{v}</span>
              </div>
            ))}
          </div>

          <ProductActions product={lite} stock={product.stock} savings={savings} />

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-high text-base font-bold text-primary-soft">
              {product.shop.initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Link href={`/explore?shop=${product.shop.slug}`} className="truncate font-display text-sm font-bold text-ink hover:text-primary-soft">
                  {product.shop.name}
                </Link>
                {product.shop.verified && <Icon name="verified" filled className="text-sm text-secondary" />}
              </div>
              <span className="text-xs text-muted">{product.shop.location} · ★ {product.shop.rating.toFixed(2)}</span>
            </div>
            <Link href={`/explore?shop=${product.shop.slug}`} className="btn btn-secondary btn-sm shrink-0">
              Visit shop
            </Link>
          </div>
        </div>
      </div>

      {/* Specs + reviews */}
      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-display text-xl font-bold text-ink">Specifications</h2>
          <div className="card overflow-hidden">
            <dl className="divide-y divide-line">
              {Object.entries({
                Brand: product.brand?.name ?? "—",
                Category: product.category.name,
                Seller: product.shop.name,
                ...specs,
                SKU: product.slug.toUpperCase(),
              }).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">Reviews</h2>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-tertiary">{avgRating.toFixed(1)}</span>
              <Rating value={avgRating} count={product.reviewCount} hideCount />
            </div>
          </div>
          <div className="space-y-3">
            {product.reviews.length === 0 && (
              <div className="card p-5 text-sm text-muted">No reviews yet — be the first to review.</div>
            )}
            {product.reviews.slice(0, 4).map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-high text-xs font-bold text-ink">
                      {r.author.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold text-ink">{r.author}</span>
                  </div>
                  <Rating value={r.rating} hideCount />
                </div>
                {r.title && <p className="mt-2 text-sm font-semibold text-ink">{r.title}</p>}
                <p className="mt-1 text-sm text-muted">{r.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            eyebrow="You may also like"
            eyebrowIcon="auto_awesome"
            title="Related products"
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={toCard(p)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
