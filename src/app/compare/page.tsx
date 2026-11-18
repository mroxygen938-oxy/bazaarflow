"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, useCompare } from "@/store/providers";
import { cn, formatBDT } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";
import { EmptyState, Rating } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

type Detail = {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  brand: string;
  category: string;
  seller: string;
  location: string;
  specs: Record<string, string>;
};

export default function ComparePage() {
  const { items, remove, clear, max } = useCompare();
  const cart = useCart();
  const [details, setDetails] = useState<Detail[]>([]);

  const ids = items.map((i) => i.id).join(",");

  useEffect(() => {
    if (!ids) return;
    let active = true;
    fetch(`/api/compare?ids=${encodeURIComponent(ids)}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) setDetails(data.products as Detail[]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [ids]);

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="compare_arrows"
          title="No products to compare"
          description={`Add up to ${max} products with the compare button to see them side by side.`}
          action={<ButtonLink href="/explore" variant="neo">Explore marketplace</ButtonLink>}
        />
      </div>
    );
  }

  const rows = buildRows(details);

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Compare products</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} of {max} products selected. Highlighted rows show meaningful differences.
          </p>
        </div>
        <button onClick={clear} className="btn btn-secondary btn-sm w-fit">
          <Icon name="delete_sweep" className="text-base" />
          Clear all
        </button>
      </div>

      {details.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-line md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-panel">
                  <th className="sticky left-0 z-10 w-40 bg-panel p-4 text-left align-top text-xs font-bold uppercase tracking-wider text-muted">
                    Product
                  </th>
                  {details.map((d) => (
                    <th key={d.id} className="min-w-[190px] border-l border-line p-4 text-left align-top font-normal">
                      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-canvas">
                        <Image src={d.image} alt={d.name} fill sizes="200px" className="object-cover" />
                        <button
                          onClick={() => remove(d.id)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-canvas/80 text-muted backdrop-blur hover:text-danger"
                          aria-label="Remove"
                        >
                          <Icon name="close" className="text-base" />
                        </button>
                      </div>
                      <Link href={`/product/${d.slug}`} className="line-clamp-2 font-display text-sm font-bold text-ink hover:text-primary-soft">
                        {d.name}
                      </Link>
                      <div className="mt-1 font-display text-base font-bold text-ink">{formatBDT(d.price)}</div>
                      <div className="mt-1"><Rating value={d.rating} count={d.reviewCount} hideCount={!d.reviewCount} /></div>
                      <button
                        onClick={() => cart.addItem(d)}
                        disabled={d.stock <= 0}
                        className="btn-neo btn-sm mt-3 w-full"
                      >
                        <CartLogo size={14} />
                        Add to bag
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className={cn("border-t border-line", row.differs && "bg-primary/[0.04]")}>
                    <td className="sticky left-0 z-10 bg-surface p-4 text-xs font-semibold text-muted">
                      <span className="flex items-center gap-1.5">
                        {row.differs && <Icon name="bolt" className="text-sm text-primary-soft" />}
                        {row.label}
                      </span>
                    </td>
                    {row.values.map((v, i) => (
                      <td key={i} className={cn("border-l border-line p-4 text-sm", row.differs ? "font-semibold text-ink" : "text-muted")}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-4 sm:grid-cols-2 md:hidden">
            {details.map((d) => (
              <div key={d.id} className="card overflow-hidden">
                <div className="relative">
                  <div className="relative aspect-square bg-canvas">
                    <Image src={d.image} alt={d.name} fill sizes="50vw" className="object-cover" />
                  </div>
                  <button
                    onClick={() => remove(d.id)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-canvas/80 text-muted backdrop-blur hover:text-danger"
                    aria-label="Remove"
                  >
                    <Icon name="close" className="text-base" />
                  </button>
                </div>
                <div className="p-3">
                  <div className="line-clamp-2 text-sm font-bold text-ink">{d.name}</div>
                  <div className="mt-1 font-display text-lg font-bold text-ink">{formatBDT(d.price)}</div>
                  <div className="mt-1"><Rating value={d.rating} hideCount /></div>
                  <div className="mt-3 space-y-1.5">
                    {rows.map((row) => (
                      <div key={row.label} className="flex justify-between gap-2 text-xs">
                        <span className="text-muted">{row.label}</span>
                        <span className="text-right text-ink">{row.values[details.findIndex((x) => x.id === d.id)]}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => cart.addItem(d)} disabled={d.stock <= 0} className="btn-neo btn-sm mt-3 w-full">
                    <CartLogo size={14} />
                    Add to bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function buildRows(details: Detail[]): { label: string; values: string[]; differs: boolean }[] {
  if (details.length === 0) return [];

  const specKeys = Array.from(
    new Set(details.flatMap((d) => Object.keys(d.specs))),
  );

  const base = [
    { label: "Price", values: details.map((d) => formatBDT(d.price)) },
    { label: "Rating", values: details.map((d) => `${d.rating.toFixed(1)} / 5`) },
    { label: "Availability", values: details.map((d) => (d.stock > 0 ? `In stock (${d.stock})` : "Out of stock")) },
    { label: "Brand", values: details.map((d) => d.brand) },
    { label: "Category", values: details.map((d) => d.category) },
    { label: "Seller", values: details.map((d) => d.seller) },
    ...specKeys.map((key) => ({
      label: key,
      values: details.map((d) => d.specs[key] ?? "—"),
    })),
  ];

  return base.map((row) => ({
    ...row,
    differs: new Set(row.values).size > 1,
  }));
}
