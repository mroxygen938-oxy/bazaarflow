/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/providers";
import { usePersistentState } from "@/lib/use-persistent";
import {
  FREE_DELIVERY_THRESHOLD,
  computeTotals,
  resolveCoupon,
} from "@/lib/pricing";
import { formatBDT } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ProgressBar } from "@/components/ui/misc";

export default function CartPage() {
  const { items, subtotal, setQuantity, removeItem, count } = useCart();
  const [appliedCode, setAppliedCode, ready] = usePersistentState<string>("bf_coupon", "");
  const [input, setInput] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (ready && appliedCode) setInput(appliedCode);
  }, [ready, appliedCode]);

  const coupon = resolveCoupon(subtotal, appliedCode);
  const totals = computeTotals(subtotal, coupon.discount);
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="shopping_bag"
          title="Your bag is empty"
          description="Explore the marketplace and add premium gear to your bag."
          action={<ButtonLink href="/explore" variant="neo">Explore marketplace</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Your bag</h1>
          <p className="mt-1 text-sm text-muted">{count} items ready for checkout</p>
        </div>
        <Link href="/explore" className="hidden items-center gap-1 text-sm font-medium text-secondary hover:underline sm:flex">
          Continue shopping
          <Icon name="arrow_forward" className="text-base" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_370px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex gap-4 p-3 sm:p-4">
              <Link href={`/product/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-canvas">
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/product/${item.slug}`} className="line-clamp-1 font-display text-sm font-bold text-ink hover:text-primary-soft sm:text-base">
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">{item.shopName ?? "BAZAARFLOW"}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-high hover:text-danger"
                    aria-label="Remove item"
                  >
                    <Icon name="delete" className="text-lg" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="flex items-center rounded-lg border border-line bg-canvas">
                    <button
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink"
                      aria-label="Decrease"
                    >
                      <Icon name="remove" className="text-base" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums text-ink">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-muted hover:text-ink"
                      aria-label="Increase"
                    >
                      <Icon name="add" className="text-base" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="block font-display text-base font-bold text-ink">
                      {formatBDT(item.price * item.quantity)}
                    </span>
                    <span className="text-[10px] text-muted">
                      {formatBDT(item.price)} each
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Link href="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline">
            <Icon name="arrow_back" className="text-base" />
            Continue shopping
          </Link>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card space-y-4 p-5">
            <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>

            {remainingForFree > 0 ? (
              <div className="rounded-xl border border-line bg-canvas p-3">
                <p className="mb-2 text-xs text-muted">
                  Add <span className="font-semibold text-ink">{formatBDT(remainingForFree)}</span> for free delivery
                </p>
                <ProgressBar value={(subtotal / FREE_DELIVERY_THRESHOLD) * 100} tone="secondary" />
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-secondary/25 bg-secondary/10 px-3 py-2 text-xs text-secondary">
                <Icon name="local_shipping" className="text-base" />
                <span className="font-semibold">Free delivery unlocked</span>
              </div>
            )}

            <div>
              <label className="label">Coupon</label>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. FLOW10"
                  className="input"
                />
                <button
                  onClick={() => {
                    setAppliedCode(input.trim().toUpperCase());
                    setTouched(true);
                  }}
                  className="btn btn-secondary btn-sm shrink-0"
                >
                  Apply
                </button>
              </div>
              {touched && coupon.error && (
                <p className="mt-2 text-xs text-danger">{coupon.error}</p>
              )}
              {coupon.coupon && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-secondary/10 px-3 py-1.5 text-xs text-secondary">
                  <span className="font-semibold">{coupon.coupon.code} applied</span>
                  <button onClick={() => { setAppliedCode(""); setInput(""); }} className="hover:text-ink">
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 border-t border-line pt-4 text-sm">
              <Row label="Subtotal" value={formatBDT(totals.subtotal)} />
              <Row label="Delivery fee" value={totals.delivery === 0 ? "Free" : formatBDT(totals.delivery)} />
              {totals.discount > 0 && (
                <Row label="Discount" value={`- ${formatBDT(totals.discount)}`} tone="secondary" />
              )}
            </div>

            <div className="flex items-end justify-between border-t border-line pt-4">
              <span className="text-sm text-muted">Total</span>
              <div className="text-right">
                <span className="block font-display text-2xl font-bold text-ink">
                  {formatBDT(totals.total)}
                </span>
                <span className="text-[10px] text-muted">Incl. VAT · BDT</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-neo btn-lg w-full">
              Proceed to checkout
              <Icon name="arrow_forward" className="text-base" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted">
              <Icon name="lock" className="text-sm" />
              Escrow-protected · Cash on Delivery available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "secondary" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-medium tabular-nums ${tone === "secondary" ? "text-secondary" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}
