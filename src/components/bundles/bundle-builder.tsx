/* eslint-disable react-hooks/purity */
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn, formatBDT } from "@/lib/utils";
import { useCart, useToast } from "@/store/providers";
import { usePersistentState } from "@/lib/use-persistent";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";
import { Badge, ProgressBar } from "@/components/ui/misc";

export type BuilderProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  shopName?: string;
  categorySlug?: string;
  categoryName?: string;
  stock?: number;
  rating?: number;
};

export type BuilderTemplate = {
  slug: string;
  name: string;
  kind: string;
  tagline: string | null;
  price: number;
  oldPrice: number;
  accent: string;
  items: { name: string; subtitle: string; price: number; image: string }[];
};

type Selected = { product: BuilderProduct; quantity: number };
type SavedBundle = { id: string; name: string; total: number; savedAt: string; items: Selected[] };

export function BundleBuilder({
  products,
  templates,
  categories,
}: {
  products: BuilderProduct[];
  templates: BuilderTemplate[];
  categories: { slug: string; name: string; icon: string }[];
}) {
  const cart = useCart();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Selected[]>([]);
  const [budget, setBudget] = useState(300000);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [bundleName, setBundleName] = useState("");
  const [saved, setSaved] = usePersistentState<SavedBundle[]>("bf_saved_bundles", []);

  const total = selected.reduce((a, b) => a + b.product.price * b.quantity, 0);
  const remaining = budget - total;
  const over = total > budget;
  const progress = budget > 0 ? (total / budget) * 100 : 0;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== "all" && p.categorySlug !== cat) return false;
      if (term && !`${p.name} ${p.shopName ?? ""}`.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [products, search, cat]);

  function addProduct(p: BuilderProduct) {
    setSelected((prev) => {
      const found = prev.find((s) => s.product.id === p.id);
      if (found) {
        return prev.map((s) =>
          s.product.id === p.id ? { ...s, quantity: s.quantity + 1 } : s,
        );
      }
      return [...prev, { product: p, quantity: 1 }];
    });
  }

  function setQty(id: string, quantity: number) {
    setSelected((prev) =>
      prev
        .map((s) => (s.product.id === id ? { ...s, quantity } : s))
        .filter((s) => s.quantity > 0),
    );
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((s) => s.product.id !== id));
  }

  function loadTemplate(t: BuilderTemplate) {
    setActiveTemplate(t.slug);
    const items: Selected[] = t.items.map((item, i) => {
      const match = products.find(
        (p) => p.name.toLowerCase() === item.name.toLowerCase(),
      ) ?? products.find((p) => p.name.toLowerCase().includes(item.name.toLowerCase().split(" ")[0] ?? ""));
      const product: BuilderProduct = match ?? {
        id: `tpl-${t.slug}-${i}`,
        slug: t.slug,
        name: item.name,
        price: item.price,
        image: item.image,
        shopName: "BAZAARFLOW Bundle",
      };
      return { product, quantity: 1 };
    });
    setSelected(items);
    const tplTotal = items.reduce((a, b) => a + b.product.price, 0);
    setBudget(Math.max(t.price, tplTotal) + 50000);
    setBundleName(t.name);
  }

  function addToCart() {
    if (!selected.length) {
      toast("Add products to your bundle first.", "error");
      return;
    }
    selected.forEach((s) => cart.addItem(s.product, s.quantity));
    toast("Bundle added to your bag");
  }

  function saveBundle() {
    if (!selected.length) {
      toast("Nothing to save yet.", "error");
      return;
    }
    const entry: SavedBundle = {
      id: `${Date.now()}`,
      name: bundleName.trim() || `My bundle · ${new Date().toLocaleDateString("en-GB")}`,
      total,
      savedAt: new Date().toISOString(),
      items: selected,
    };
    setSaved((prev) => [entry, ...prev].slice(0, 20));
    toast("Bundle saved to your dashboard");
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="chip mb-2 bg-primary/15 text-primary-soft">
            <Icon name="hub" className="text-sm" />
            Smart bundle builder
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Build your perfect setup</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Pick a starter template or start from scratch. Set your budget and we
            keep the running total honest.
          </p>
        </div>
      </div>

      {/* Template chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setActiveTemplate("scratch");
            setSelected([]);
            setBundleName("");
          }}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
            activeTemplate === "scratch"
              ? "border-primary/50 bg-primary/10 text-ink"
              : "border-line bg-surface text-muted hover:text-ink",
          )}
        >
          <Icon name="add" className="text-base" />
          From scratch
        </button>
        {templates.map((t) => (
          <button
            key={t.slug}
            onClick={() => loadTemplate(t)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors",
              activeTemplate === t.slug
                ? "border-primary/50 bg-primary/10 text-ink"
                : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            <Icon
              name={
                t.kind === "gaming"
                  ? "sports_esports"
                  : t.kind === "student"
                    ? "school"
                    : t.kind === "office"
                      ? "desk"
                      : t.kind === "travel"
                        ? "luggage"
                        : "redeem"
              }
              className="text-base text-primary-soft"
            />
            {t.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: catalog */}
        <div>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products to add…"
                className="input h-10 pl-10"
              />
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setCat("all")}
              className={cn("chip shrink-0", cat === "all" ? "bg-primary text-white" : "bg-high text-muted")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setCat(c.slug)}
                className={cn("chip shrink-0", cat === c.slug ? "bg-primary text-white" : "bg-high text-muted")}
              >
                <Icon name={c.icon} className="text-sm" />
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.slice(0, 24).map((p) => {
              const inBundle = selected.some((s) => s.product.id === p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-surface p-2.5 transition-colors",
                    inBundle ? "border-primary/40" : "border-line",
                  )}
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image src={p.image} alt={p.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-semibold text-ink">{p.name}</div>
                    <div className="text-[11px] text-muted">{p.categoryName ?? p.shopName}</div>
                    <div className="mt-0.5 font-display text-sm font-bold text-ink">{formatBDT(p.price)}</div>
                  </div>
                  <button
                    onClick={() => addProduct(p)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:brightness-110"
                    aria-label="Add to bundle"
                  >
                    <Icon name="add" className="text-lg" />
                  </button>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
                No products match your search.
              </div>
            )}
          </div>
        </div>

        {/* Right: summary */}
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Your bundle</h2>
              <Badge tone={over ? "danger" : "secondary"}>
                {selected.reduce((a, b) => a + b.quantity, 0)} items
              </Badge>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted">Budget</span>
                <span className={cn("font-semibold", over ? "text-danger" : "text-secondary")}>
                  {over ? `${formatBDT(-remaining)} over` : `${formatBDT(remaining)} left`}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={1000000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-high accent-primary"
                aria-label="Bundle budget"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                <span>৳ 10,000</span>
                <span className="font-display text-sm font-bold text-ink">{formatBDT(budget)}</span>
                <span>৳ 1,000,000</span>
              </div>
            </div>

            <ProgressBar value={progress} tone={over ? "danger" : "gradient"} />
            {over && (
              <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                <Icon name="warning" className="text-base" />
                Budget exceeded by {formatBDT(-remaining)}. Remove or swap an item.
              </div>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {selected.length === 0 && (
                <div className="rounded-lg border border-dashed border-line py-8 text-center text-xs text-muted">
                  Add products from the catalogue to start your bundle.
                </div>
              )}
              {selected.map((s) => (
                <div key={s.product.id} className="flex items-center gap-2 rounded-lg border border-line bg-canvas p-2">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface">
                    <Image src={s.product.image} alt={s.product.name} fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-xs font-semibold text-ink">{s.product.name}</div>
                    <div className="text-[10px] text-muted">{formatBDT(s.product.price)}</div>
                  </div>
                  <div className="flex items-center rounded-md border border-line">
                    <button onClick={() => setQty(s.product.id, s.quantity - 1)} className="flex h-6 w-6 items-center justify-center text-muted hover:text-ink">
                      <Icon name="remove" className="text-sm" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-ink">{s.quantity}</span>
                    <button onClick={() => setQty(s.product.id, s.quantity + 1)} className="flex h-6 w-6 items-center justify-center text-muted hover:text-ink">
                      <Icon name="add" className="text-sm" />
                    </button>
                  </div>
                  <button onClick={() => remove(s.product.id)} className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-danger" aria-label="Remove">
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between border-t border-line pt-3">
              <span className="text-sm text-muted">Bundle total</span>
              <span className={cn("font-display text-2xl font-bold", over ? "text-danger" : "text-ink")}>
                {formatBDT(total)}
              </span>
            </div>

            <input
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="Name your bundle (optional)"
              className="input"
            />

            <div className="grid grid-cols-2 gap-2">
              <button onClick={saveBundle} className="btn btn-secondary">
                <Icon name="bookmark" className="text-base" />
                Save
              </button>
              <button onClick={addToCart} className="btn-neo">
                <CartLogo size={16} />
                Add to bag
              </button>
            </div>

            {saved.length > 0 && (
              <div className="border-t border-line pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Saved bundles ({saved.length})
                </span>
                <div className="mt-2 space-y-1">
                  {saved.slice(0, 3).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelected(b.items);
                        setBudget(Math.max(b.total + 50000, 10000));
                        setBundleName(b.name);
                        toast(`Loaded “${b.name}”`, "info");
                      }}
                      className="flex w-full items-center justify-between rounded-lg bg-high px-2.5 py-1.5 text-left text-xs hover:bg-bright"
                    >
                      <span className="truncate text-ink">{b.name}</span>
                      <span className="shrink-0 text-muted">{formatBDT(b.total)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
