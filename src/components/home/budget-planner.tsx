"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn, formatBDT } from "@/lib/utils";
import type { ProductLite } from "@/lib/types";
import { useCart } from "@/store/providers";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";
import { ProgressBar } from "@/components/ui/misc";

type BudgetProduct = ProductLite & { categorySlug: string; categoryName: string };

export function BudgetPlanner({
  products,
  categories,
}: {
  products: BudgetProduct[];
  categories: { slug: string; name: string }[];
}) {
  const [budget, setBudget] = useState(75000);
  const [cat, setCat] = useState("all");
  const { addItem } = useCart();

  const picks = useMemo(() => {
    const pool = products
      .filter((p) => (cat === "all" ? true : p.categorySlug === cat))
      .filter((p) => p.price <= budget)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.price - b.price);
    const chosen: BudgetProduct[] = [];
    let remaining = budget;
    for (const p of pool) {
      if (chosen.length >= 5) break;
      if (p.price <= remaining) {
        chosen.push(p);
        remaining -= p.price;
      }
    }
    return chosen;
  }, [products, cat, budget]);

  const allocated = picks.reduce((a, b) => a + b.price, 0);
  const remaining = budget - allocated;

  return (
    <div className="rounded-3xl border border-line bg-gradient-to-br from-panel via-surface to-canvas p-5 shadow-2xl lg:p-10">
      <div className="grid items-center gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-5 lg:col-span-5">
          <div>
            <div className="chip mb-3 bg-secondary/15 text-secondary">
              <Icon name="tune" className="text-sm" />
              Smart allocation engine
            </div>
            <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
              Your Budget. Your Perfect Picks.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Set your target investment. Our solver curates non-conflicting,
              optimized setups that extract maximal performance from every Taka.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-elevated/70 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted">Target expenditure</span>
              <span className="font-display text-2xl font-bold tabular-nums text-secondary">
                {formatBDT(budget)}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-high accent-secondary"
              aria-label="Budget"
            />
            <div className="mt-2 flex justify-between text-[11px] font-medium text-muted">
              <span>৳ 10,000</span>
              <span>৳ 250,000</span>
              <span>৳ 500,000</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
              Archetype:
            </span>
            <button
              onClick={() => setCat("all")}
              className={cn(
                "chip",
                cat === "all" ? "bg-primary text-white" : "bg-high text-muted hover:text-ink",
              )}
            >
              All balance
            </button>
            {categories.slice(0, 4).map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={cn(
                  "chip",
                  cat === c.slug ? "bg-primary text-white" : "bg-high text-muted hover:text-ink",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-7">
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-elevated/60 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/20 text-secondary">
                <Icon name="check_circle" className="text-lg" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Simulated optimal composition
                </span>
                <span className="text-sm font-bold text-ink">
                  {picks.length} matching certified picks
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-[10px] text-muted">Allocated</span>
                <span className="font-display text-base font-bold text-ink">
                  {formatBDT(allocated)}
                </span>
              </div>
              <span
                className={cn(
                  "chip",
                  remaining >= 0
                    ? "bg-tertiary/15 text-tertiary"
                    : "bg-danger/15 text-danger",
                )}
              >
                {remaining >= 0 ? `${formatBDT(remaining)} left` : "Over budget"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {picks.length === 0 && (
              <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
                No products fit this budget. Try increasing it.
              </div>
            )}
            {picks.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-ink">{p.name}</div>
                    <div className="truncate text-xs text-muted">{p.shopName}</div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block font-display text-sm font-bold text-ink">
                    {formatBDT(p.price)}
                  </span>
                  <span className="text-[10px] text-muted">
                    {Math.round((p.price / budget) * 100)}% of budget
                  </span>
                </div>
              </div>
            ))}
          </div>

          <ProgressBar value={budget ? (allocated / budget) * 100 : 0} tone={remaining < 0 ? "danger" : "gradient"} />

          <div className="flex flex-col items-center justify-between gap-3 pt-1 sm:flex-row">
            <span className="text-center text-[11px] text-muted sm:text-left">
              Price lock guaranteed for 2 hours with automated Dhaka escrow delivery.
            </span>
            <button
              onClick={() => picks.forEach((p) => addItem(p))}
              disabled={picks.length === 0}
              className="btn-neo w-full sm:w-auto"
            >
              <CartLogo size={16} />
              Add this assembly to bag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
