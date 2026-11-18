"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { cn, formatBDT, formatDate, timeAgo } from "@/lib/utils";
import type { ProductCardData } from "@/components/product/product-card";
import { ProductCard } from "@/components/product/product-card";
import { useCart, useToast, useWishlist } from "@/store/providers";
import { usePersistentState } from "@/lib/use-persistent";
import { updateProfileAction, type AuthState } from "@/app/actions/auth";
import { Icon } from "@/components/ui/icon";
import { CartLogo } from "@/components/ui/cart-logo";
import { EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import {
  DashboardShell,
  StatCard,
  StatusPill,
  type DashNavItem,
} from "@/components/dashboard/dashboard-shell";

export type AccountOrder = {
  id: string;
  orderNo: string;
  status: string;
  createdAt: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  items: { id: string; name: string; image: string; price: number; quantity: number }[];
};
export type AccountAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  postal: string | null;
  isDefault: boolean;
};
export type AccountAlert = {
  id: string;
  targetPrice: number;
  product: { name: string; image: string; slug: string; price: number };
};
export type AccountNotification = {
  id: string;
  title: string;
  body: string;
  kind: string;
  read: boolean;
  createdAt: string;
};
type SavedBundle = {
  id: string;
  name: string;
  total: number;
  savedAt: string;
  items: { quantity: number }[];
};

const tabs: DashNavItem[] = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "orders", label: "My Orders", icon: "package_2" },
  { key: "wishlist", label: "Wishlist", icon: "favorite" },
  { key: "bundles", label: "My Bundles", icon: "hub" },
  { key: "price", label: "Price Watchlist", icon: "price_change" },
  { key: "notifications", label: "Notifications", icon: "notifications" },
  { key: "addresses", label: "Addresses", icon: "location_on" },
  { key: "settings", label: "Account Settings", icon: "settings" },
];

export function AccountDashboard({
  user,
  orders,
  addresses,
  alerts,
  notifications,
  recent,
  initialTab,
}: {
  user: { name: string; email: string; phone: string };
  orders: AccountOrder[];
  addresses: AccountAddress[];
  alerts: AccountAlert[];
  notifications: AccountNotification[];
  recent: ProductCardData[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState(initialTab && tabs.some((t) => t.key === initialTab) ? initialTab : "overview");
  const wishlist = useWishlist();
  const cart = useCart();
  const { toast } = useToast();
  const [savedBundles, setSavedBundles] = usePersistentState<SavedBundle[]>("bf_saved_bundles", []);
  const [alertActive, setAlertActive] = useState<Record<string, boolean>>(
    Object.fromEntries(alerts.map((a) => [a.id, true])),
  );
  const [notifs, setNotifs] = useState(notifications);

  const pendingCount = orders.filter((o) => ["PENDING", "PROCESSING"].includes(o.status)).length;
  const unread = notifs.filter((n) => !n.read).length;

  const nav = tabs.map((t) => {
    if (t.key === "orders") return { ...t, badge: pendingCount };
    if (t.key === "wishlist") return { ...t, badge: wishlist.count };
    if (t.key === "notifications") return { ...t, badge: unread };
    return t;
  });

  return (
    <DashboardShell
      role="Customer dashboard"
      user={{ name: user.name, email: user.email, role: "CUSTOMER" }}
      nav={nav}
      active={tab}
      onActive={setTab}
    >
      {tab === "overview" && (
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Hello, {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-muted">Here&apos;s what&apos;s happening with your shopping.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon="package_2" label="Total orders" value={String(orders.length)} />
            <StatCard icon="schedule" label="Pending" value={String(pendingCount)} tone="tertiary" />
            <StatCard icon="favorite" label="Saved products" value={String(wishlist.count)} tone="secondary" />
            <StatCard icon="price_change" label="Active price alerts" value={String(alerts.length)} tone="primary" />
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <h2 className="font-display text-base font-bold text-ink">Recent orders</h2>
              <button onClick={() => setTab("orders")} className="text-xs font-medium text-secondary hover:underline">
                View all
              </button>
            </div>
            <div className="divide-y divide-line">
              {orders.slice(0, 4).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {o.items.slice(0, 3).map((it) => (
                        <div key={it.id} className="relative h-9 w-9 overflow-hidden rounded-lg border-2 border-surface bg-canvas">
                          <Image src={it.image} alt={it.name} fill sizes="36px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">{o.orderNo}</div>
                      <div className="text-[11px] text-muted">{formatDate(o.createdAt)} · {o.items.length} items</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={o.status} />
                    <span className="hidden font-display text-sm font-bold text-ink sm:block">{formatBDT(o.total)}</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted">No orders yet.</div>}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-ink">Recently viewed</h2>
              <ButtonLink href="/explore" variant="ghost" size="sm">Explore more</ButtonLink>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {recent.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">My orders</h1>
          {orders.length === 0 ? (
            <EmptyState icon="package_2" title="No orders yet" description="Your placed orders will appear here." action={<ButtonLink href="/explore">Start shopping</ButtonLink>} />
          ) : (
            orders.map((o) => (
              <div key={o.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-canvas px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-ink">{o.orderNo}</span>
                      <StatusPill status={o.status} />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">{formatDate(o.createdAt)} · {o.paymentMethod}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-base font-bold text-ink">{formatBDT(o.total)}</div>
                    <div className="text-[11px] text-muted">{o.items.length} items</div>
                  </div>
                </div>
                <div className="divide-y divide-line">
                  {o.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-canvas">
                        <Image src={it.image} alt={it.name} fill sizes="44px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm text-ink">{it.name}</div>
                        <div className="text-[11px] text-muted">Qty {it.quantity} · {formatBDT(it.price)}</div>
                      </div>
                      <span className="text-sm font-semibold text-ink">{formatBDT(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 border-t border-line px-4 py-3">
                  <button onClick={() => toast("Tracking link sent to your email.", "info")} className="btn btn-secondary btn-sm">
                    <Icon name="local_shipping" className="text-sm" />
                    Track
                  </button>
                  <button
                    onClick={() => o.items.forEach((it) => cart.addItem({ id: it.id, slug: "", name: it.name, price: it.price, image: it.image }))}
                    className="btn-neo btn-sm"
                  >
                    <Icon name="repeat" className="text-sm" />
                    Buy again
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "wishlist" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-ink">Wishlist</h1>
            <ButtonLink href="/wishlist" variant="secondary" size="sm">Manage</ButtonLink>
          </div>
          {wishlist.items.length === 0 ? (
            <EmptyState icon="favorite" title="Nothing saved yet" description="Tap the heart on products you love." action={<ButtonLink href="/explore">Discover products</ButtonLink>} />
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {wishlist.items.map((p) => (
                <div key={p.id} className="card flex items-center gap-3 p-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-semibold text-ink">{p.name}</div>
                    <div className="text-xs text-ink">{formatBDT(p.price)}</div>
                  </div>
                  <button onClick={() => cart.addItem(p)} className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#FFE600] shadow-[2px_2px_0_0_#000] transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#FFF033] hover:shadow-[3px_3px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:bg-[#FFD000] active:shadow-none" aria-label="Add to bag">
                    <CartLogo size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "bundles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-ink">My bundles</h1>
            <ButtonLink href="/bundles" size="sm"><Icon name="add" className="text-sm" />New bundle</ButtonLink>
          </div>
          {savedBundles.length === 0 ? (
            <EmptyState icon="hub" title="No saved bundles" description="Build a setup in the bundle builder and save it here." action={<ButtonLink href="/bundles">Open bundle builder</ButtonLink>} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {savedBundles.map((b) => (
                <div key={b.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-ink">{b.name}</h3>
                    <button onClick={() => setSavedBundles((prev) => prev.filter((x) => x.id !== b.id))} className="text-muted hover:text-danger" aria-label="Delete bundle">
                      <Icon name="delete" className="text-base" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted">{b.items.length} components · {timeAgo(b.savedAt)}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-ink">{formatBDT(b.total)}</span>
                    <ButtonLink href="/bundles" variant="secondary" size="sm">Load</ButtonLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "price" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Price watchlist</h1>
          <div className="card divide-y divide-line">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                  <Image src={a.product.image} alt={a.product.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${a.product.slug}`} className="line-clamp-1 text-sm font-semibold text-ink hover:text-primary-soft">
                    {a.product.name}
                  </Link>
                  <div className="text-[11px] text-muted">
                    Current {formatBDT(a.product.price)} · Target <span className="text-tertiary">{formatBDT(a.targetPrice)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setAlertActive((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                  className={cn("chip", alertActive[a.id] ? "bg-secondary/15 text-secondary" : "bg-high text-muted")}
                >
                  {alertActive[a.id] ? "Active" : "Paused"}
                </button>
              </div>
            ))}
            {alerts.length === 0 && <div className="p-8 text-center text-sm text-muted">No price alerts yet.</div>}
          </div>
        </div>
      )}

      {tab === "notifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-ink">Notifications</h1>
            <button onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))} className="text-xs font-medium text-secondary hover:underline">
              Mark all read
            </button>
          </div>
          <div className="card divide-y divide-line">
            {notifs.map((n) => {
              const icon = n.kind === "price" ? "price_change" : n.kind === "shipping" || n.kind === "order" ? "package_2" : "group";
              return (
                <div key={n.id} className={cn("flex gap-3 p-4", !n.read && "bg-primary/[0.04]")}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-high text-primary-soft">
                    <Icon name={icon} className="text-lg" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{n.title}</span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-secondary" />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                    <span className="mt-1 block text-[10px] text-outline">{timeAgo(n.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            {notifs.length === 0 && <div className="p-8 text-center text-sm text-muted">You&apos;re all caught up.</div>}
          </div>
        </div>
      )}

      {tab === "addresses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-ink">Addresses</h1>
            <button onClick={() => toast("Address form is ready in the checkout flow.", "info")} className="btn btn-secondary btn-sm">
              <Icon name="add" className="text-sm" />Add address
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="chip bg-high text-ink">{a.label}</span>
                  {a.isDefault && <span className="chip bg-secondary/15 text-secondary">Default</span>}
                </div>
                <div className="mt-3 text-sm font-semibold text-ink">{a.fullName}</div>
                <div className="text-xs text-muted">{a.phone}</div>
                <div className="mt-1 text-xs text-muted">{a.street}, {a.area}, {a.city}{a.postal ? ` ${a.postal}` : ""}</div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toast("Address editing is a demo action.", "info")} className="btn btn-secondary btn-sm flex-1">Edit</button>
                  <button onClick={() => toast("Set as default (demo).", "info")} className="btn btn-ghost btn-sm flex-1">Set default</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "settings" && <SettingsTab user={user} />}
    </DashboardShell>
  );
}

function SettingsTab({ user }: { user: { name: string; email: string; phone: string } }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updateProfileAction, null);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Account settings</h1>
      <div className="card p-5">
        <form action={action} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Full name</label>
              <input name="name" defaultValue={user.name} className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" defaultValue={user.phone} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Email</label>
              <input defaultValue={user.email} disabled className="input opacity-60" />
            </div>
          </div>
          {state?.error && <p className="text-xs text-danger">{state.error}</p>}
          {state?.success && <p className="text-xs text-secondary">{state.success}</p>}
          <button disabled={pending} className="btn btn-primary">
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
      <div className="card flex items-center justify-between p-5">
        <div>
          <div className="text-sm font-semibold text-ink">Theme</div>
          <div className="text-xs text-muted">Switch between dark and light appearance from the header.</div>
        </div>
      </div>
    </div>
  );
}
