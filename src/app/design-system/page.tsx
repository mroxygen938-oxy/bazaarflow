import { db } from "@/lib/db";
import { productInclude, toCard } from "@/lib/product-view";
import { Icon } from "@/components/ui/icon";
import { ProductCard } from "@/components/product/product-card";
import { Badge, EmptyState, ProgressBar, Rating, SectionHeading, Skeleton } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Design System" };

const palette = [
  { name: "Canvas", css: "--c-canvas", hex: "#090B13" },
  { name: "Panel", css: "--c-panel", hex: "#101421" },
  { name: "Surface", css: "--c-surface", hex: "#171B2B" },
  { name: "Elevated", css: "--c-elevated", hex: "#20263A" },
  { name: "High", css: "--c-high", hex: "#262C42" },
  { name: "Primary", css: "--c-primary", hex: "#8B72FF" },
  { name: "Primary soft", css: "--c-primary-soft", hex: "#A996FF" },
  { name: "Secondary", css: "--c-secondary", hex: "#5ED6E8" },
  { name: "Tertiary", css: "--c-tertiary", hex: "#FFB95C" },
  { name: "Ink", css: "--c-ink", hex: "#F5F6FA" },
  { name: "Muted", css: "--c-muted", hex: "#9CA3B8" },
  { name: "Danger", css: "--c-danger", hex: "#FF6B7A" },
];

export default async function DesignSystemPage() {
  const demo = await db.product.findFirst({ include: productInclude, where: { trending: true } });

  return (
    <div className="container-page py-10">
      <div className="mb-10">
        <Badge tone="primary">Obsidian Lumina</Badge>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">BAZAARFLOW design system</h1>
        <p className="mt-2 max-w-2xl text-muted">
          A dark-first premium system: calibrated surface tiers, electric violet + cyan
          accents, Manrope display type and Inter body. Every component is reusable.
        </p>
      </div>

      <SectionHeading eyebrow="Foundation" eyebrowIcon="palette" title="Color tokens" />
      <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {palette.map((c) => (
          <div key={c.name} className="overflow-hidden rounded-xl border border-line">
            <div className="h-16 w-full" style={{ background: `var(${c.css})` }} />
            <div className="bg-surface p-2.5">
              <div className="text-xs font-semibold text-ink">{c.name}</div>
              <div className="text-[10px] text-muted">{c.hex}</div>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading eyebrow="Foundation" eyebrowIcon="text_fields" title="Typography" />
      <div className="mb-12 space-y-4 rounded-2xl border border-line bg-surface p-6">
        <p className="font-display text-5xl font-bold tracking-tight text-ink">Shopping, Reimagined.</p>
        <p className="font-display text-3xl font-semibold text-ink">Headline · Manrope 600</p>
        <p className="text-base text-muted">
          Body · Inter 400. The quick brown fox jumps over the lazy dog. Prices render with
          tabular numerals: <span className="font-semibold text-ink tabular-nums">৳ 245,000</span>.
        </p>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-soft">
          Label caps · eyebrow
        </p>
      </div>

      <SectionHeading eyebrow="Components" eyebrowIcon="widgets" title="Buttons, badges & inputs" />
      <div className="mb-12 grid gap-4 lg:grid-cols-3">
        <div className="card space-y-3 p-5">
          <h3 className="text-sm font-bold text-ink">Buttons</h3>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>
        <div className="card space-y-3 p-5">
          <h3 className="text-sm font-bold text-ink">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge tone="primary">Primary</Badge>
            <Badge tone="secondary">Secondary</Badge>
            <Badge tone="tertiary">-12% OFF</Badge>
            <Badge tone="danger">Cancelled</Badge>
            <Badge tone="neutral">Neutral</Badge>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Rating value={4.9} count={340} />
            <span className="text-xs text-muted">·</span>
            <Rating value={4.6} count={88} size="md" />
          </div>
        </div>
        <div className="card space-y-3 p-5">
          <h3 className="text-sm font-bold text-ink">Inputs</h3>
          <input className="input" placeholder="Search products…" />
          <select className="input">
            <option>Sort: Featured</option>
          </select>
          <div>
            <div className="mb-1 flex justify-between text-[10px] text-muted"><span>Progress</span><span>72%</span></div>
            <ProgressBar value={72} />
          </div>
        </div>
      </div>

      <SectionHeading eyebrow="Components" eyebrowIcon="inventory_2" title="Product card & states" />
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {demo && <ProductCard product={toCard(demo)} />}
        <div className="card flex flex-col gap-3 p-4">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="card flex items-center justify-center p-4">
          <EmptyState icon="inbox" title="Empty state" description="No items to show." />
        </div>
        <div className="card flex flex-col items-center justify-center gap-3 p-6 text-center">
          <Logo />
          <p className="text-xs text-muted">Glass, aurora and gradient utilities</p>
          <div className="flex gap-2">
            {["home", "explore", "sports_esports", "graphic_eq", "watch"].map((i) => (
              <span key={i} className="flex h-9 w-9 items-center justify-center rounded-lg bg-high text-primary-soft">
                <Icon name={i} className="text-lg" />
              </span>
            ))}
          </div>
        </div>
      </div>

      <SectionHeading eyebrow="Foundation" eyebrowIcon="straighten" title="Radii, elevation & spacing" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["rounded-lg", "0.5rem · controls"],
          ["rounded-xl", "0.75rem · buttons"],
          ["rounded-2xl", "1rem · cards"],
          ["rounded-3xl", "1.5rem · sheets"],
        ].map(([cls, label]) => (
          <div key={cls} className="card p-5">
            <div className={`h-16 w-full ${cls} bg-gradient-to-br from-primary/30 to-secondary/20`} />
            <div className="mt-3 text-xs font-semibold text-ink">{cls}</div>
            <div className="text-[11px] text-muted">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
