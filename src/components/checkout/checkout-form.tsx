"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/store/providers";
import { usePersistentState } from "@/lib/use-persistent";
import { computeTotals, resolveCoupon } from "@/lib/pricing";
import { placeOrder } from "@/app/actions/orders";
import { formatBDT } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";

type Defaults = {
  name: string;
  email: string;
  phone: string;
  address: string;
  area: string;
  city: string;
} | null;

const EXPRESS_FEE = 250;

const paymentOptions = [
  { value: "COD", label: "Cash on Delivery", icon: "payments", desc: "Pay when it arrives" },
  { value: "BKASH", label: "bKash", icon: "account_balance_wallet", desc: "Instant mobile payment" },
  { value: "NAGAD", label: "Nagad", icon: "smartphone", desc: "Mobile wallet" },
  { value: "CARD", label: "Card", icon: "credit_card", desc: "Visa / Mastercard" },
] as const;

const shippingOptions = [
  { value: "standard", label: "Standard delivery", desc: "2–4 business days", icon: "local_shipping" },
  { value: "express", label: "Express Dhaka", desc: "Same-day within Dhaka", icon: "bolt", fee: EXPRESS_FEE },
  { value: "pickup", label: "Pickup", desc: "Banani flagship hub", icon: "storefront", fee: 0 },
] as const;

export function CheckoutForm({ defaults }: { defaults: Defaults }) {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [appliedCode, setAppliedCode, ready] = usePersistentState<string>("bf_coupon", "");
  const [couponInput, setCouponInput] = useState("");
  const [touched, setTouched] = useState(false);

  const [name, setName] = useState(defaults?.name ?? "");
  const [email, setEmail] = useState(defaults?.email ?? "");
  const [phone, setPhone] = useState(defaults?.phone ?? "");
  const [address, setAddress] = useState(defaults?.address ?? "");
  const [area, setArea] = useState(defaults?.area ?? "");
  const [city, setCity] = useState(defaults?.city ?? "Dhaka");
  const [note, setNote] = useState("");
  const [shipping, setShipping] = useState<"standard" | "express" | "pickup">("standard");
  const [payment, setPayment] = useState<(typeof paymentOptions)[number]["value"]>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  if (!ready) return null;

  if (items.length === 0 && !placed) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon="shopping_bag"
          title="Nothing to check out"
          description="Add products to your bag before proceeding to checkout."
          action={<ButtonLink href="/explore" variant="neo">Explore marketplace</ButtonLink>}
        />
      </div>
    );
  }

  const coupon = resolveCoupon(subtotal, appliedCode);
  const base = computeTotals(subtotal, coupon.discount);
  const delivery = shipping === "express" ? EXPRESS_FEE : shipping === "pickup" ? 0 : base.delivery;
  const total = Math.max(0, subtotal - base.discount) + delivery;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await placeOrder({
      customerName: name,
      phone,
      email,
      address,
      area,
      city,
      note,
      shippingMethod: shipping,
      paymentMethod: payment,
      couponCode: appliedCode,
      items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
    });
    if (res.ok) {
      setPlaced(true);
      clearCart();
      setCouponCode("");
      router.push(`/checkout/success?order=${res.orderNo}`);
    } else {
      setError(res.error);
      setSubmitting(false);
    }
  }

  function setCouponCode(value: string) {
    setAppliedCode(value);
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="mb-6">
        <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          <Icon name="arrow_back" className="text-base" />
          Back to bag
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Checkout</h1>
        <p className="mt-1 text-sm text-muted">Secure, escrow-protected checkout in BDT.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Section icon="person" title="Customer information">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" value={name} onChange={setName} placeholder="Ayesha Karim" />
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+8801XXXXXXXXX" />
              <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" type="email" className="sm:col-span-2" />
            </div>
          </Section>

          <Section icon="location_on" title="Delivery address">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Street address" value={address} onChange={setAddress} placeholder="House 24, Road 11" className="sm:col-span-2" />
              <Field label="Area" value={area} onChange={setArea} placeholder="Banani" />
              <Field label="City" value={city} onChange={setCity} placeholder="Dhaka" />
              <Field label="Order note (optional)" value={note} onChange={setNote} placeholder="Delivery instructions" className="sm:col-span-2" />
            </div>
          </Section>

          <Section icon="local_shipping" title="Shipping method">
            <div className="grid gap-2 sm:grid-cols-3">
              {shippingOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setShipping(opt.value)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    shipping === opt.value
                      ? "border-primary/50 bg-primary/10"
                      : "border-line bg-canvas hover:border-line-strong"
                  }`}
                >
                  <Icon name={opt.icon} className="text-lg text-primary-soft" />
                  <div className="mt-2 text-sm font-semibold text-ink">{opt.label}</div>
                  <div className="text-xs text-muted">{opt.desc}</div>
                  <div className="mt-1 text-xs font-semibold text-secondary">
                    {opt.value === "express"
                      ? formatBDT(EXPRESS_FEE)
                      : opt.value === "pickup"
                        ? "Free"
                        : base.delivery === 0
                          ? "Free"
                          : formatBDT(base.delivery)}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          <Section icon="credit_card" title="Payment method">
            <div className="grid gap-2 sm:grid-cols-2">
              {paymentOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setPayment(opt.value)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    payment === opt.value
                      ? "border-primary/50 bg-primary/10"
                      : "border-line bg-canvas hover:border-line-strong"
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-high text-primary-soft">
                    <Icon name={opt.icon} className="text-lg" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink">{opt.label}</div>
                    <div className="text-xs text-muted">{opt.desc}</div>
                  </div>
                  <span className={`ml-auto flex h-4 w-4 items-center justify-center rounded-full border ${payment === opt.value ? "border-primary" : "border-line-strong"}`}>
                    {payment === opt.value && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
              <Icon name="lock" className="text-sm text-secondary" />
              Payments are protected by BAZAARFLOW escrow until delivery is confirmed.
            </p>
          </Section>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card space-y-4 p-5">
            <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>

            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-xs font-semibold text-ink">{item.name}</div>
                    <div className="text-[11px] text-muted">{formatBDT(item.price)}</div>
                  </div>
                  <span className="text-xs font-bold text-ink">{formatBDT(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-3">
              <label className="label">Coupon</label>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={appliedCode || "e.g. FLOW10"}
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCouponCode(couponInput.trim().toUpperCase());
                    setTouched(true);
                  }}
                  className="btn btn-secondary btn-sm shrink-0"
                >
                  Apply
                </button>
              </div>
              {touched && coupon.error && <p className="mt-1.5 text-xs text-danger">{coupon.error}</p>}
              {coupon.coupon && (
                <p className="mt-1.5 text-xs text-secondary">{coupon.coupon.code} applied · {coupon.coupon.label}</p>
              )}
            </div>

            <div className="space-y-2 border-t border-line pt-3 text-sm">
              <SummaryRow label="Subtotal" value={formatBDT(subtotal)} />
              <SummaryRow label="Delivery" value={delivery === 0 ? "Free" : formatBDT(delivery)} />
              {base.discount > 0 && <SummaryRow label="Discount" value={`- ${formatBDT(base.discount)}`} tone="secondary" />}
            </div>

            <div className="flex items-end justify-between border-t border-line pt-3">
              <span className="text-sm text-muted">Total</span>
              <div className="text-right">
                <span className="block font-display text-2xl font-bold text-ink">{formatBDT(total)}</span>
                <span className="text-[10px] text-muted">Incl. VAT · BDT</span>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-neo w-full" >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                  Placing order…
                </>
              ) : (
                <>
                  <Icon name="lock" className="text-base" />
                  Place order · {formatBDT(total)}
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-muted">
              By placing this order you agree to BAZAARFLOW&apos;s terms &amp; privacy policy.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-high text-primary-soft">
          <Icon name={icon} className="text-lg" />
        </span>
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="input"
      />
    </div>
  );
}

function SummaryRow({ label, value, tone }: { label: string; value: string; tone?: "secondary" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-medium tabular-nums ${tone === "secondary" ? "text-secondary" : "text-ink"}`}>{value}</span>
    </div>
  );
}
