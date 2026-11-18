"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn, formatBDT } from "@/lib/utils";
import type { ProductLite } from "@/lib/types";
import { useCart } from "@/store/providers";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";
import { ProgressBar } from "@/components/ui/misc";

export type BundleView = {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  kind: string;
  price: number;
  oldPrice: number;
  accent: string;
  items: { name: string; subtitle: string; price: number; image: string }[];
};

const accentTone: Record<string, string> = {
  primary: "from-primary to-secondary",
  secondary: "from-secondary to-primary",
  tertiary: "from-tertiary to-primary",
};

export function BundleShowcase({ bundles }: { bundles: BundleView[] }) {
  const [selected, setSelected] = useState(0);
  const { addItem } = useCart();
  const bundle = bundles[selected];

  if (!bundle) return null;


  function addBundle() {
    bundle.items.forEach((item, i) => {
      const lite: ProductLite = {
        id: `bundle-${bundle.slug}-${i}`,
        slug: bundle.slug,
        name: item.name,
        price: item.price,
        image: item.image,
        shopName: "BAZAARFLOW Bundle",
      };
      addItem(lite);
    });
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-panel p-5 shadow-2xl lg:p-10">
      <div className="aurora -right-24 -top-24 h-80 w-80 bg-primary/20" />
      <div className="aurora -bottom-24 -left-24 h-80 w-80 bg-secondary/15" />

      <div className="relative z-10 mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="chip mb-3 bg-primary/15 text-primary-soft">
            <Icon name="hub" className="text-sm" />
            Algorithm-driven savings
          </div>
          <h2 className="font-display text-2xl font-bold text-ink md:text-3xl lg:text-4xl">
            Everything You Need.{" "}
            <span className="gradient-text">One Perfect Bundle.</span>
          </h2>
          <p className="mt-3 text-sm text-muted md:text-base">
            Build a complete shopping bundle around your needs and budget. Save up
            to 22% when bundled together directly from verified Dhaka distributors.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-line bg-elevated/70 p-3.5 backdrop-blur">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary/15 text-tertiary">
            <Icon name="savings" className="text-2xl" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
              Collective savings index
            </div>
            <div className="font-display text-lg font-bold text-tertiary">
              Up to {formatBDT(42000)} off
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          {bundles.map((b, i) => {
            const active = i === selected;
            const save = b.oldPrice - b.price;
            return (
              <button
                key={b.slug}
                onClick={() => setSelected(i)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
                  active
                    ? "border-primary/40 bg-elevated shadow-lift"
                    : "border-line bg-surface hover:bg-high",
                )}
              >
                {active && (
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b",
                      accentTone[b.accent] ?? accentTone.primary,
                    )}
                  />
                )}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                    {active ? "Selected bundle" : b.kind}
                  </span>
                  <span className="chip bg-secondary/15 text-secondary">
                    Save {formatBDT(save)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-ink">{b.name}</h3>
                    <span className="text-xs text-muted">{b.tagline}</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-display text-lg font-bold text-ink">
                      {formatBDT(b.price)}
                    </span>
                    <span className="text-xs text-muted line-through">
                      {formatBDT(b.oldPrice)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-line bg-canvas p-5 lg:col-span-7 lg:p-6">
          <div>
            <div className="flex flex-col justify-between gap-2 pb-4 sm:flex-row sm:items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
                  Configuration breakdown
                </span>
                <h4 className="font-display text-lg font-bold text-ink">{bundle.name}</h4>
              </div>
              <span className="chip w-fit bg-high text-muted">
                <Icon name="verified" className="text-sm text-secondary" />
                Plug & play guaranteed
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {bundle.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">{item.name}</div>
                      <div className="truncate text-xs text-muted">{item.subtitle}</div>
                    </div>
                  </div>
                  <div className="shrink-0 font-display text-sm font-bold text-ink">
                    {formatBDT(item.price)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-line bg-surface p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-muted">Bundle efficiency</span>
                <span className="font-bold text-secondary">100% unlocked</span>
              </div>
              <ProgressBar value={100} />
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                <span>Standalone: {formatBDT(bundle.oldPrice)}</span>
                <span className="text-tertiary">Free Dhaka concierge setup</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-line pt-5 sm:flex-row">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                Consolidated total
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-ink">
                  {formatBDT(bundle.price)}
                </span>
                <span className="text-xs font-semibold text-secondary">BDT</span>
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Link href="/bundles" className="btn btn-secondary flex-1 sm:flex-none">
                <Icon name="tune" className="text-base" />
                Customize
              </Link>
              <button onClick={addBundle} className="btn-neo flex-1 sm:flex-none">
                <CartLogo size={16} />
                Add bundle to bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
