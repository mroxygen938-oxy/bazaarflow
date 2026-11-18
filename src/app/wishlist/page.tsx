"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, useWishlist } from "@/store/providers";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";
import { EmptyState, Price, Rating } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

export default function WishlistPage() {
  const { items, remove, count } = useWishlist();
  const cart = useCart();

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="favorite"
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it for later."
          action={<ButtonLink href="/explore">Discover products</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Your wishlist</h1>
          <p className="mt-1 text-sm text-muted">{count} saved products</p>
        </div>
        <button
          onClick={() => items.forEach((i) => cart.addItem(i))}
          className="btn-neo btn-sm w-fit"
        >
          <CartLogo size={16} />
          Add all to bag
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((p) => (
          <div key={p.id} className="card card-hover flex flex-col overflow-hidden p-4">
            <div className="mb-3 flex items-start justify-between">
              <span className="chip bg-high text-muted">Saved</span>
              <button
                onClick={() => remove(p.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-high/70 text-tertiary transition-colors hover:text-danger"
                aria-label="Remove from wishlist"
              >
                <Icon name="favorite" filled className="text-lg" />
              </button>
            </div>
            <Link href={`/product/${p.slug}`} className="relative mb-4 aspect-square overflow-hidden rounded-xl bg-canvas">
              <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="line-clamp-1 flex items-center gap-1 text-muted">
                  <Icon name="verified" filled className="text-sm text-secondary" />
                  {p.shopName ?? "BAZAARFLOW"}
                </span>
                {p.rating != null && <Rating value={p.rating} hideCount />}
              </div>
              <Link href={`/product/${p.slug}`} className="line-clamp-1 font-display text-base font-bold text-ink hover:text-primary-soft">
                {p.name}
              </Link>
              <div className="mt-auto pt-4">
                <Price value={p.price} oldPrice={p.oldPrice} />
                <button onClick={() => cart.addItem(p)} className="btn-neo btn-sm mt-3 w-full">
                  <CartLogo size={16} />
                  Add to bag
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
