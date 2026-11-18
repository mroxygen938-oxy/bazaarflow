/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn, formatBDT } from "@/lib/utils";
import type { ProductCardData } from "@/components/product/product-card";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/misc";

export type ExploreProduct = ProductCardData & {
  categorySlug: string;
  categoryName: string;
  brandSlug: string;
  brandName: string;
  shopSlug: string;
};

type Cat = { slug: string; name: string; icon: string };
type Simple = { slug: string; name: string };

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "discount", label: "Biggest discount" },
];

const PAGE_SIZE = 12;

export function ExploreClient({
  products,
  categories,
  brands,
  shops,
  initialCategory,
  initialShop,
  initialQuery,
}: {
  products: ExploreProduct[];
  categories: Cat[];
  brands: Simple[];
  shops: Simple[];
  initialCategory: string;
  initialShop: string;
  initialQuery: string;
}) {
  const maxBound = Math.max(...products.map((p) => p.price), 500000);

  const [q, setQ] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [shop, setShop] = useState(initialShop);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(maxBound);
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [q, category, shop, selectedBrands, minRating, inStockOnly, maxPrice, sort]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (term) {
        const hay = `${p.name} ${p.subtitle ?? ""} ${p.brandName} ${p.categoryName} ${p.shopName ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (category !== "all" && p.categorySlug !== category) return false;
      if (shop !== "all" && p.shopSlug !== shop) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brandSlug)) return false;
      if (minRating && (p.rating ?? 0) < minRating) return false;
      if (inStockOnly && (p.stock ?? 0) <= 0) return false;
      if (p.price > maxPrice) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return (b.rating ?? 0) - (a.rating ?? 0);
        case "discount": {
          const da = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
          const db = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
          return db - da;
        }
        default:
          return 0;
      }
    });
    return list;
  }, [products, q, category, shop, selectedBrands, minRating, inStockOnly, maxPrice, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function clearAll() {
    setQ("");
    setCategory("all");
    setShop("all");
    setSelectedBrands([]);
    setMinRating(0);
    setInStockOnly(false);
    setMaxPrice(maxBound);
    setSort("featured");
  }

  function toggleBrand(slug: string) {
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (shop !== "all" ? 1 : 0) +
    selectedBrands.length +
    (minRating ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < maxBound ? 1 : 0);

  const filterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
          Filters
        </h3>
        <button onClick={clearAll} className="text-xs font-medium text-secondary hover:underline">
          Clear all
        </button>
      </div>

      <div>
        <span className="label">Category</span>
        <div className="space-y-1">
          <FilterRadio
            checked={category === "all" && shop === "all"}
            onChange={() => {
              setCategory("all");
              setShop("all");
            }}
            label="All categories"
          />
          {categories.map((c) => (
            <FilterRadio
              key={c.slug}
              checked={category === c.slug}
              onChange={() => setCategory(c.slug)}
              label={c.name}
              icon={c.icon}
            />
          ))}
        </div>
      </div>

      {shops.length > 0 && (
        <div>
          <span className="label">Seller</span>
          <select
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            className="input"
          >
            <option value="all">All sellers</option>
            {shops.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="label mb-0">Max price</span>
          <span className="text-xs font-semibold tabular-nums text-secondary">
            {formatBDT(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={maxBound}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-high accent-secondary"
          aria-label="Maximum price"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted">
          <span>{formatBDT(0)}</span>
          <span>{formatBDT(maxBound)}</span>
        </div>
      </div>

      <div>
        <span className="label">Brand</span>
        <div className="max-h-44 space-y-1 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label
              key={b.slug}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-high hover:text-ink"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(b.slug)}
                onChange={() => toggleBrand(b.slug)}
                className="h-4 w-4 accent-primary"
              />
              {b.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="label">Rating</span>
        <div className="space-y-1">
          {[
            [0, "Any rating"],
            [4, "4.0 & up"],
            [4.5, "4.5 & up"],
            [4.8, "4.8 & up"],
          ].map(([v, label]) => (
            <FilterRadio
              key={String(v)}
              checked={minRating === v}
              onChange={() => setMinRating(v as number)}
              label={label as string}
            />
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-canvas px-3 py-2.5">
        <span className="text-sm text-ink">In stock only</span>
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(e) => setInStockOnly(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      </label>
    </div>
  );

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Link href="/" className="hover:text-ink">Home</Link>
          <Icon name="chevron_right" className="text-sm" />
          <span className="text-ink">Explore</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
          Explore the marketplace
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {filtered.length} curated products from verified Dhaka flagship sellers,
          filtered to your needs.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, brands, sellers…"
            className="input h-11 pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawer(true)}
            className="btn btn-secondary btn-sm lg:hidden"
          >
            <Icon name="tune" className="text-base" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input h-10 pr-8 text-sm"
              aria-label="Sort"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 card p-5">{filterPanel}</div>
        </aside>

        <div>
          {pageItems.length === 0 ? (
            <EmptyState
              icon="search_off"
              title="No products match those filters"
              description="Try widening your budget, clearing brands, or exploring a different category."
              action={
                <button onClick={clearAll} className="btn btn-primary">
                  Reset filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {pageItems.map((p) => (
                  <ProductCard key={p.id} product={p} variant="glass" />
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <span className="text-xs text-muted">
                  Showing {(current - 1) * PAGE_SIZE + 1}–
                  {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                {pageCount > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={current === 1}
                      className="btn btn-secondary btn-sm"
                    >
                      <Icon name="chevron_left" className="text-base" />
                    </button>
                    {Array.from({ length: pageCount }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                          current === i + 1
                            ? "bg-primary text-white"
                            : "bg-high text-muted hover:text-ink",
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                      disabled={current === pageCount}
                      className="btn btn-secondary btn-sm"
                    >
                      <Icon name="chevron_right" className="text-base" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto border-r border-line bg-panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-ink">Filters</span>
              <button
                onClick={() => setDrawer(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-high text-muted"
              >
                <Icon name="close" />
              </button>
            </div>
            {filterPanel}
            <button onClick={() => setDrawer(false)} className="btn btn-primary mt-6 w-full">
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterRadio({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  icon?: string;
}) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
        checked ? "bg-primary/10 text-ink" : "text-muted hover:bg-high hover:text-ink",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-primary" : "border-line-strong",
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      {icon && <Icon name={icon} className="text-base" />}
      <span className="truncate">{label}</span>
    </button>
  );
}
