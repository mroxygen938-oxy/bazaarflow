import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatBDT, formatDate } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNo } = await searchParams;
  const order = orderNo
    ? await db.order.findUnique({ where: { orderNo }, include: { items: true } })
    : null;

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-[0_18px_40px_-12px_rgba(139,114,255,0.7)]">
            <Icon name="check" className="text-4xl" weight={600} />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold text-ink">Order confirmed</h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            Thank you! Your order is placed and protected by BAZAARFLOW escrow.
            {order && ` We sent a confirmation to ${order.email ?? "your email"}.`}
          </p>
          {order && (
            <div className="mt-4 flex items-center gap-2 rounded-full border border-line bg-high px-4 py-2 text-sm">
              <Icon name="receipt_long" className="text-base text-secondary" />
              <span className="font-semibold text-ink">{order.orderNo}</span>
              <span className="text-muted">· {formatDate(order.createdAt)}</span>
            </div>
          )}
        </div>

        {order ? (
          <div className="mt-8 card overflow-hidden">
            <div className="divide-y divide-line">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-semibold text-ink">{item.name}</div>
                    <div className="text-xs text-muted">Qty {item.quantity} · {formatBDT(item.price)}</div>
                  </div>
                  <span className="text-sm font-bold text-ink">{formatBDT(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-line bg-canvas p-4 text-sm">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span className="text-ink">{formatBDT(order.subtotal)}</span></div>
              <div className="flex justify-between text-muted"><span>Delivery</span><span className="text-ink">{order.deliveryFee === 0 ? "Free" : formatBDT(order.deliveryFee)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-muted"><span>Discount</span><span className="text-secondary">- {formatBDT(order.discount)}</span></div>}
              <div className="flex justify-between border-t border-line pt-2 font-bold text-ink"><span>Total</span><span>{formatBDT(order.total)}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-line p-4 text-xs">
              <div>
                <span className="block text-muted">Payment</span>
                <span className="font-semibold text-ink">{order.paymentMethod}</span>
              </div>
              <div>
                <span className="block text-muted">Deliver to</span>
                <span className="font-semibold text-ink">{order.city}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 card p-6 text-center text-sm text-muted">
            Your order was placed successfully. View it anytime in your dashboard.
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/account?tab=orders" className="flex-1">
            <Icon name="package_2" className="text-base" />
            Track my order
          </ButtonLink>
          <ButtonLink href="/explore" variant="secondary" className="flex-1">
            Continue shopping
          </ButtonLink>
        </div>
        <p className="mt-4 text-center text-xs text-muted">
          Need help? <Link href="/account" className="text-secondary hover:underline">Contact the concierge desk</Link>
        </p>
      </div>
    </div>
  );
}
