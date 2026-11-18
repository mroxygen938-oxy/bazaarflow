"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, formatBDT } from "@/lib/utils";
import type { ProductLite } from "@/lib/types";
import { useCart, useCompare, useWishlist } from "@/store/providers";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";

export function ProductActions({
  product,
  stock,
  savings,
}: {
  product: ProductLite;
  stock: number;
  savings: number | null;
}) {
  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const soldOut = stock <= 0;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-xl border border-line bg-canvas">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-muted hover:text-ink"
            aria-label="Decrease quantity"
          >
            <Icon name="remove" className="text-lg" />
          </button>
          <span className="w-10 text-center text-sm font-bold tabular-nums text-ink">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            className="flex h-11 w-11 items-center justify-center text-muted hover:text-ink"
            aria-label="Increase quantity"
          >
            <Icon name="add" className="text-lg" />
          </button>
        </div>
        <button
          onClick={() => cart.addItem(product, qty)}
          disabled={soldOut}
          className="btn-neo btn-lg flex-1"
        >
          <CartLogo size={18} />
          Add to cart
        </button>
        <button
          onClick={() => {
            cart.addItem(product, qty);
            router.push("/checkout");
          }}
          disabled={soldOut}
          className="btn btn-secondary btn-lg flex-1"
        >
          <Icon name="bolt" className="text-base text-primary-soft" />
          Buy now
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => wishlist.toggle(product)}
          className={cn(
            "btn btn-outline btn-sm",
            wishlist.has(product.id) && "border-tertiary/50 text-tertiary",
          )}
        >
          <Icon name="favorite" filled={wishlist.has(product.id)} className="text-base" />
          {wishlist.has(product.id) ? "Saved" : "Wishlist"}
        </button>
        <button
          onClick={() => compare.toggle(product)}
          className={cn(
            "btn btn-outline btn-sm",
            compare.has(product.id) && "border-secondary/50 text-secondary",
          )}
        >
          <Icon name="compare_arrows" className="text-base" />
          {compare.has(product.id) ? "In compare" : "Compare"}
        </button>
        <button className="btn btn-ghost btn-sm">
          <Icon name="share" className="text-base" />
          Share
        </button>
      </div>

      {savings != null && savings > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-tertiary/25 bg-tertiary/10 px-3 py-2.5 text-xs text-tertiary">
          <Icon name="local_offer" className="text-base" />
          <span className="font-semibold">
            You save {formatBDT(savings)} on this configuration
          </span>
        </div>
      )}
    </div>
  );
}
