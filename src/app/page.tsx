import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { productInclude, toCard } from "@/lib/product-view";
import { formatBDT } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { ProgressBar, SectionHeading } from "@/components/ui/misc";
import { ProductCard } from "@/components/product/product-card";
import { BundleShowcase, type BundleView } from "@/components/home/bundle-showcase";
import { BudgetPlanner } from "@/components/home/budget-planner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, trending, bundlesRaw, sellers, groupBuy, budgetProducts] =
    await Promise.all([
      db.category.findMany({ include: { _count: { select: { products: true } } } }),
      db.product.findMany({
        where: { trending: true },
        include: productInclude,
        take: 8,
      }),
      db.bundle.findMany({ where: { featured: true } }),
      db.shop.findMany({ orderBy: { totalSales: "desc" }, take: 4 }),
      db.groupBuy.findFirst({ orderBy: { endsAt: "asc" } }),
      db.product.findMany({ include: productInclude, take: 60 }),
    ]);

  const bundles: BundleView[] = bundlesRaw.map((b) => ({
    slug: b.slug,
    name: b.name,
    tagline: b.tagline,
    description: b.description,
    kind: b.kind,
    price: b.price,
    oldPrice: b.oldPrice,
    accent: b.accent,
    items: JSON.parse(b.items) as BundleView["items"],
  }));

  const catById = new Map(categories.map((c) => [c.id, c]));
  const plannerProducts = budgetProducts.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.image,
    rating: p.rating,
    shopName: p.shop?.name,
    categorySlug: catById.get(p.categoryId)?.slug ?? "",
    categoryName: p.category?.name ?? "",
  }));

  const catList = categories.map((c) => ({ slug: c.slug, name: c.name }));

  const trendingCards = trending.map((p) => ({ product: toCard(p) }));
  const half = Math.ceil(trendingCards.length / 2);
  const rowA = trendingCards.slice(0, half);
  const rowB = trendingCards.slice(half);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="aurora -top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2 bg-primary/20" />
        <div className="container-page relative grid items-center gap-10 py-10 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-6">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-line bg-high/60 px-3.5 py-1.5 backdrop-blur">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-secondary" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
                The sovereign tech atelier
              </span>
              <span className="text-outline">•</span>
              <span className="text-xs text-muted">Dhaka &amp; global cross-border</span>
            </div>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Shopping, <span className="gradient-text">Reimagined</span>
              <br className="hidden sm:block" /> Around You.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted">
              Discover curated premium products, build your tailor-made setups, and
              shop smarter with BAZAARFLOW. Precision gear backed by escrow
              protection across Bangladesh.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className="group relative inline-flex w-full cursor-pointer select-none items-center justify-center gap-3 rounded-xl border-[3px] border-black bg-[#FFE600] px-9 py-4 text-lg font-black uppercase tracking-wider text-black shadow-[6px_6px_0px_0px_#000] transition-all duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:bg-[#FFF033] hover:shadow-[10px_10px_0px_0px_#000] active:translate-x-1.5 active:translate-y-1.5 active:bg-[#FFD000] active:shadow-[0px_0px_0px_0px_#000] sm:w-auto"
              >
                <svg
                  className="pointer-events-none absolute -right-4 -top-4 z-10 h-7 w-7 scale-50 fill-[#FFE600] opacity-0 transition-all duration-200 group-hover:rotate-12 group-hover:scale-110 group-hover:opacity-100"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                </svg>
                <span>Explore marketplace</span>
                <svg
                  className="h-5 w-5 stroke-[3px] transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </Link>
              <Link href="/bundles" className="btn btn-secondary btn-lg w-full sm:w-auto">
                <Icon name="auto_fix_high" className="text-base text-primary-soft" />
                Build your bundle
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                { value: "৳ 45M+", label: "Verified trades", tone: "text-ink" },
                { value: "1,200+", label: "Flagship sellers", tone: "text-secondary" },
                { value: "99.8%", label: "Dhaka on-time", tone: "text-tertiary" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className={`font-display text-2xl font-bold ${s.tone}`}>{s.value}</span>
                  <span className="mt-0.5 text-xs text-muted">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Showcase */}
          <div className="lg:col-span-6">
            <div className="relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-3xl border border-line bg-panel p-4 shadow-2xl sm:aspect-[16/11]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,114,255,0.16),transparent_65%)]" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-high/80 px-3 py-1.5 backdrop-blur">
                  <Icon name="workspace_premium" className="text-sm text-tertiary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary">
                    Curated pick of the day
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-high/70 px-3 py-1 text-xs text-muted">
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  Active vault #04
                </span>
              </div>

              <div className="relative z-10 my-auto flex items-center justify-center py-4">
                <div className="relative h-[220px] w-full sm:h-[280px]">
                  <Image
                    src="/images/products/img-03.jpg"
                    alt="Keychron Q1 Pro mechanical keyboard and Sony WH-1000XM5 headphones"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="rounded-2xl object-cover drop-shadow-[0_25px_35px_rgba(0,0,0,0.55)]"
                  />
                </div>
                <div className="absolute -top-1 right-2 flex items-center gap-2.5 rounded-2xl border border-line bg-elevated/90 px-3 py-2 shadow-xl backdrop-blur sm:right-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                    <Icon name="headphones" className="text-base" />
                  </span>
                  <div>
                    <div className="text-[9px] uppercase text-muted">Active noise-cancelling</div>
                    <div className="text-xs font-semibold text-ink">Sony WH-1000XM5</div>
                    <div className="text-xs font-bold text-secondary">৳ 38,500</div>
                  </div>
                </div>
                <div className="absolute bottom-1 left-2 flex items-center gap-2.5 rounded-2xl border border-line bg-elevated/90 px-3 py-2 shadow-xl backdrop-blur sm:left-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary-soft">
                    <Icon name="keyboard" className="text-base" />
                  </span>
                  <div>
                    <div className="text-[9px] uppercase text-muted">QMK/VIA wireless</div>
                    <div className="text-xs font-semibold text-ink">Keychron Q1 Pro</div>
                    <div className="text-xs font-bold text-primary-soft">৳ 23,900</div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-4 gap-2">
                {[
                  ["01 AUDIO", "B&O Studio"],
                  ["02 DISPLAY", "Apple 5K"],
                  ["03 OPTICS", "Leica Q3"],
                  ["04 CHAIR", "Embody"],
                ].map(([cap, title], i) => (
                  <div
                    key={cap}
                    className={`rounded-xl p-2 text-left ${i === 0 ? "bg-high" : "bg-high/50"}`}
                  >
                    <span className="block text-[9px] text-muted">{cap}</span>
                    <span className="block truncate text-xs font-medium text-ink">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="container-page py-12 lg:py-16">
        <SectionHeading
          eyebrow="Taxonomy of excellence"
          eyebrowIcon="dataset"
          title="Explore curated domains"
          action={
            <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline hover:underline-offset-4">
              Browse full catalogue
              <Icon name="arrow_forward" className="text-base" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {categories.map((c) => {
            const accent =
              c.accent === "secondary"
                ? "text-secondary"
                : c.accent === "tertiary"
                  ? "text-tertiary"
                  : "text-primary-soft";
            const accentBg =
              c.accent === "secondary"
                ? "bg-secondary/15"
                : c.accent === "tertiary"
                  ? "bg-tertiary/15"
                  : "bg-primary/15";
            return (
              <Link
                key={c.id}
                href={`/explore?category=${c.slug}`}
                className="group card card-hover relative overflow-hidden p-4"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentBg} ${accent}`}>
                    <Icon name={c.icon} className="text-xl" />
                  </span>
                  <span className="rounded-full bg-high px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {c._count.products} items
                  </span>
                </div>
                <div className="relative my-4 h-24 overflow-hidden rounded-xl bg-canvas">
                  {c.image && (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 45vw, 22vw"
                      className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                </div>
                <h3 className="font-display text-base font-semibold text-ink transition-colors group-hover:text-primary-soft">
                  {c.name}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-muted">{c.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================= SMART BUNDLE ================= */}
      <section id="bundles" className="container-page py-8 lg:py-12">
        <BundleShowcase bundles={bundles} />
      </section>

      {/* ================= TRENDING ================= */}
      <section className="container-page py-12 lg:py-16">
        <SectionHeading
          eyebrow="Live velocity feed"
          eyebrowIcon="local_fire_department"
          eyebrowTone="secondary"
          title="Trending curated releases"
          action={
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="chip bg-primary text-white">All spotlight</span>
              <span className="chip bg-high text-muted">Flagship exclusives</span>
              <span className="chip bg-high text-muted">Ready in Dhaka</span>
            </div>
          }
        />
        <div className="space-y-5">
          {[rowA, rowB].map((row, rowIdx) => (
            <div key={rowIdx} className="marquee-track">
              <div className="marquee marquee-left">
                {[...row, ...row].map((item, i) => (
                  <div key={i} className="marquee-item">
                    <ProductCard product={item.product} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/explore" className="btn btn-outline">
            View all products
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </div>
      </section>

      {/* ================= BUDGET ================= */}
      <section className="container-page py-8 lg:py-12">
        <BudgetPlanner products={plannerProducts} categories={catList} />
      </section>

      {/* ================= SELLERS ================= */}
      <section className="container-page py-12 lg:py-16">
        <SectionHeading
          eyebrow="Direct merchant tier"
          eyebrowIcon="verified_user"
          eyebrowTone="tertiary"
          title="Verified flagship ateliers"
          action={
            <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:underline hover:underline-offset-4">
              View all 1,200+ sellers
              <Icon name="arrow_forward" className="text-base" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sellers.map((s, i) => (
            <div key={s.id} className="card card-hover flex flex-col p-5">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-high text-lg font-bold ${
                    i % 3 === 0 ? "text-primary-soft" : i % 3 === 1 ? "text-secondary" : "text-tertiary"
                  }`}
                >
                  {s.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-display text-sm font-bold text-ink">{s.name}</h3>
                    {s.verified && <Icon name="verified" filled className="text-sm text-secondary" />}
                  </div>
                  <span className="text-xs text-muted">{s.location}</span>
                </div>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-canvas p-3 text-center">
                <div>
                  <span className="block text-[10px] uppercase text-muted">Rating</span>
                  <span className="font-display text-sm font-bold text-tertiary">{s.rating.toFixed(2)} / 5</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-muted">Turnover</span>
                  <span className="font-display text-sm font-bold text-ink">
                    ৳ {(s.totalSales / 1e6).toFixed(1)}M
                  </span>
                </div>
              </div>
              <p className="line-clamp-2 text-xs text-muted">{s.description}</p>
              <Link
                href={`/explore?shop=${s.slug}`}
                className="btn btn-secondary btn-sm mt-4 w-full"
              >
                Visit flagship
                <Icon name="open_in_new" className="text-sm" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= EDITORIAL OFFERS ================= */}
      <section className="container-page pb-16 pt-6">
        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          {groupBuy && (
            <div className="card relative flex flex-col justify-between overflow-hidden p-5 shadow-2xl lg:col-span-8 lg:p-8">
              <div className="aurora -right-10 -top-10 h-72 w-72 bg-secondary/15" />
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="chip bg-secondary/15 text-secondary">
                    <Icon name="group" className="text-sm" />
                    Active tiered group buy
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-tertiary">
                    <Icon name="timer" className="text-base" />
                    Limited window
                  </span>
                </div>
                <div className="grid items-center gap-6 md:grid-cols-12">
                  <div className="md:col-span-7">
                    <h3 className="font-display text-2xl font-bold text-ink lg:text-3xl">
                      {groupBuy.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{groupBuy.description}</p>
                    <div className="mt-5 rounded-2xl border border-line bg-canvas p-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-ink">
                          {groupBuy.members} / {groupBuy.targetMembers} backers
                        </span>
                        <span className="font-bold text-secondary">
                          {groupBuy.targetMembers - groupBuy.members} more to unlock
                        </span>
                      </div>
                      <ProgressBar value={(groupBuy.members / groupBuy.targetMembers) * 100} />
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                        <span>Tier 1 · 15% unlocked</span>
                        <span>Tier 2 · 20% unlocked</span>
                        <span className="font-bold text-tertiary">Tier 3 · 25% pending</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-48 md:col-span-5">
                    {groupBuy.productImage && (
                      <Image
                        src={groupBuy.productImage}
                        alt={groupBuy.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="rounded-2xl object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-line pt-5 sm:flex-row">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-2xl font-bold text-ink">
                      {formatBDT(groupBuy.price)}
                    </span>
                    <span className="text-sm text-muted line-through">{formatBDT(groupBuy.oldPrice)}</span>
                  </div>
                  <span className="text-xs font-semibold text-secondary">
                    Escrow held until minimum volume validates
                  </span>
                </div>
                <Link href="/groups" className="btn-neo w-full sm:w-auto">
                  Commit to group buy
                  <Icon name="how_to_reg" className="text-base" />
                </Link>
              </div>
            </div>
          )}

          <div className="card flex flex-col justify-between p-5 shadow-2xl lg:col-span-4 lg:p-6">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary-soft">
                <Icon name="shield_lock" className="text-2xl" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                The Flow Sovereign Protocol
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Every transaction is protected by a multi-signature escrow protocol
                tailored for Bangladesh.
              </p>
              <div className="mt-5 space-y-4">
                {[
                  ["verified_user", "Zero counterfeit pledge", "300% refund on non-original serials"],
                  ["local_shipping", "Armored Dhaka logistics", "Dedicated couriers for fragile electronics"],
                  ["headset_mic", "Dedicated VIP desk", "Phone & WhatsApp concierge on standby"],
                ].map(([icon, title, body]) => (
                  <div key={title} className="flex items-start gap-3">
                    <Icon name={icon} className="mt-0.5 text-lg text-secondary" />
                    <div>
                      <span className="block text-sm font-semibold text-ink">{title}</span>
                      <span className="text-xs text-muted">{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/design-system" className="btn btn-secondary mt-6 w-full">
              Read escrow specifications
              <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
