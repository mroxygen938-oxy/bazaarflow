"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn, discountPct, formatBDT } from "@/lib/utils";
import type { ProductLite } from "@/lib/types";
import { useCart, useCompare, useWishlist } from "@/store/providers";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";
import { Badge, Price, Rating } from "@/components/ui/misc";

export type ProductCardData = ProductLite & {
  subtitle?: string | null;
  badge?: string | null;
  reviewCount?: number;
  stock?: number;
};

function badgeTone(badge: string) {
  if (badge.includes("-") || badge.includes("OFF")) return "tertiary" as const;
  if (badge.includes("GROUP") || badge.includes("ATELIER") || badge.includes("ESPORTS") || badge.includes("FLAGSHIP"))
    return "primary" as const;
  if (badge.includes("CHOICE") || badge.includes("SMART")) return "secondary" as const;
  return "neutral" as const;
}

export function ProductCard({
  product,
  variant = "solid",
}: {
  product: ProductCardData;
  variant?: "solid" | "glass";
}) {
  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();
  const [quickView, setQuickView] = useState(false);

  const lite: ProductLite = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    image: product.image,
    rating: product.rating,
    shopName: product.shopName,
    category: product.category,
  };

  const inWishlist = wishlist.has(product.id);
  const inCompare = compare.has(product.id);
  const off = discountPct(product.price, product.oldPrice);
  const stock = product.stock ?? 0;

  return (
    <>
      <div className={cn("group flex flex-col overflow-hidden p-4", variant === "glass" ? "glass-card" : "card card-hover")}>
        <div className="mb-3 flex items-center justify-between">
          {product.badge ? (
            <Badge tone={badgeTone(product.badge)}>{product.badge}</Badge>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() => wishlist.toggle(lite)}
              aria-label="Toggle wishlist"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-high/70 text-muted transition-colors hover:text-tertiary",
                inWishlist && "text-tertiary",
              )}
            >
              <Icon name="favorite" filled={inWishlist} className="text-lg" />
            </button>
            <button
              onClick={() => compare.toggle(lite)}
              aria-label="Add to compare"
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-high/70 text-muted transition-colors hover:text-secondary",
                inCompare && "text-secondary",
              )}
            >
              <Icon name="compare_arrows" className="text-lg" />
            </button>
            <button
              onClick={() => setQuickView(true)}
              aria-label="Quick view"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-high/70 text-muted transition-colors hover:text-secondary"
            >
              <Icon name="visibility" className="text-lg" />
            </button>
          </div>
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="relative mb-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-canvas"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {stock > 0 ? (
            <span className="absolute bottom-3 left-3 rounded-md bg-canvas/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary backdrop-blur">
              In stock · Dhaka Hub
            </span>
          ) : (
            <span className="absolute bottom-3 left-3 rounded-md bg-canvas/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-danger backdrop-blur">
              Out of stock
            </span>
          )}
          {off && (
            <span className="absolute right-3 top-3 rounded-full bg-tertiary px-2 py-0.5 text-[11px] font-bold text-black">
              -{off}%
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1 font-medium text-muted">
              <Icon name="verified" filled className="text-sm text-secondary" />
              <span className="line-clamp-1">{product.shopName ?? "BAZAARFLOW"}</span>
            </span>
            <Rating value={product.rating ?? 4.8} count={product.reviewCount} hideCount={!product.reviewCount} />
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-1 font-display text-base font-bold text-ink transition-colors group-hover:text-primary-soft">
              {product.name}
            </h3>
          </Link>
          {product.subtitle && (
            <p className="mt-1 line-clamp-1 text-xs text-muted">{product.subtitle}</p>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <Price value={product.price} oldPrice={product.oldPrice} />
            <button
              onClick={() => cart.addItem(lite)}
              disabled={stock <= 0}
              className="btn-neo btn-sm"
            >
              <CartLogo size={16} />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>

      {quickView && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setQuickView(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-line bg-elevated shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQuickView(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-high text-muted hover:text-ink"
              aria-label="Close quick view"
            >
              <Icon name="close" />
            </button>
            <div className="grid gap-0 md:grid-cols-2">
              <div className="relative aspect-square bg-canvas">
                <Image src={product.image} alt={product.name} fill sizes="50vw" className="object-cover" />
              </div>
              <div className="flex flex-col p-6 md:p-8">
                <div className="mb-3 flex items-center gap-2">
                  {product.badge && <Badge tone={badgeTone(product.badge)}>{product.badge}</Badge>}
                  <Rating value={product.rating ?? 4.8} count={product.reviewCount} />
                </div>
                <h3 className="font-display text-2xl font-bold text-ink">{product.name}</h3>
                <p className="mt-1 text-sm text-muted">{product.shopName}</p>
                <p className="mt-4 text-sm text-muted">{product.subtitle}</p>
                <div className="mt-6">
                  <Price value={product.price} oldPrice={product.oldPrice} size="lg" />
                  {off && (
                    <span className="mt-1 inline-block text-xs font-semibold text-tertiary">
                      You save {formatBDT((product.oldPrice ?? 0) - product.price)} ({off}%)
                    </span>
                  )}
                </div>
                <div className="mt-auto flex gap-3 pt-6">
                  <button
                    onClick={() => {
                      cart.addItem(lite);
                      setQuickView(false);
                    }}
                    className="btn-neo flex-1"
                  >
                    <CartLogo size={18} />
                    Add to bag
                  </button>
                  <Link href={`/product/${product.slug}`} className="btn btn-secondary">
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
