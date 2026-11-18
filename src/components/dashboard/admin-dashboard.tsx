"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, formatBDT, formatDate, initials } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Rating } from "@/components/ui/misc";
import {
  DashboardShell,
  StatCard,
  StatusPill,
  type DashNavItem,
} from "@/components/dashboard/dashboard-shell";
import { BarChart, ShareList, type Point } from "@/components/dashboard/charts";
import { approveSellerAction, rejectSellerAction } from "@/app/actions/admin";

type AdminUser = { id: string; name: string; email: string; role: string; createdAt: string };
type AdminShop = { id: string; name: string; location: string; rating: number; verified: boolean; productCount: number };
type AdminProduct = { id: string; name: string; price: number; stock: number; shopName: string; categoryName: string; image: string };
type AdminCategory = { id: string; name: string; slug: string; icon: string; count: number };
type AdminOrder = { id: string; orderNo: string; customerName: string; status: string; total: number; createdAt: string };
type AdminReview = { id: string; author: string; rating: number; body: string; productName: string };
type AdminComplaint = { id: string; subject: string; message: string; status: string };
type AdminCoupon = { code: string; type: string; value: number; minSpend: number; active: boolean; uses: number };
type SellerRequest = { id: string; name: string; email: string; shopName: string | null; requestedAt: string };

const tabs: DashNavItem[] = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "users", label: "Users", icon: "group" },
  { key: "sellers", label: "Sellers", icon: "storefront" },
  { key: "requests", label: "Seller Requests", icon: "how_to_reg" },
  { key: "products", label: "Products", icon: "inventory_2" },
  { key: "categories", label: "Categories", icon: "category" },
  { key: "orders", label: "Orders", icon: "receipt_long" },
  { key: "reviews", label: "Reviews", icon: "reviews" },
  { key: "complaints", label: "Complaints", icon: "report" },
  { key: "coupons", label: "Coupons", icon: "local_offer" },
  { key: "analytics", label: "Analytics", icon: "insights" },
  { key: "settings", label: "Settings", icon: "settings" },
];

export function AdminDashboard({
  stats,
  users,
  shops,
  products,
  categories,
  orders,
  reviews,
  complaints,
  coupons,
  revenueSeries,
  categoryShare,
  sellerRequests,
}: {
  stats: { users: number; sellers: number; products: number; orders: number; revenue: number; pending: number };
  users: AdminUser[];
  shops: AdminShop[];
  products: AdminProduct[];
  categories: AdminCategory[];
  orders: AdminOrder[];
  reviews: AdminReview[];
  complaints: AdminComplaint[];
  coupons: AdminCoupon[];
  revenueSeries: Point[];
  categoryShare: Point[];
  sellerRequests: SellerRequest[];
}) {
  const [tab, setTab] = useState("overview");
  const nav = tabs.map((t) => {
    if (t.key === "complaints") return { ...t, badge: complaints.filter((c) => c.status === "OPEN").length };
    if (t.key === "requests") return { ...t, badge: sellerRequests.length };
    return t;
  });

  return (
    <DashboardShell
      role="Admin console"
      user={{ name: "BAZAARFLOW", email: "Marketplace administration", role: "ADMIN" }}
      nav={nav}
      active={tab}
      onActive={setTab}
    >
      {tab === "overview" && (
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Marketplace overview</h1>
            <p className="text-sm text-muted">Platform health, GMV and moderation queue.</p>
          </div>
          {sellerRequests.length > 0 && (
            <button
              onClick={() => setTab("requests")}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-tertiary/30 bg-tertiary/10 px-4 py-3 text-left transition-colors hover:bg-tertiary/15"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tertiary/20 text-tertiary">
                  <Icon name="how_to_reg" className="text-lg" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {sellerRequests.length} seller application{sellerRequests.length > 1 ? "s" : ""} awaiting review
                  </span>
                  <span className="text-xs text-muted">Approve or decline new sellers to keep the marketplace verified.</span>
                </span>
              </span>
              <span className="chip bg-tertiary/20 text-tertiary">Review</span>
            </button>
          )}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon="group" label="Users" value={String(stats.users)} />
            <StatCard icon="storefront" label="Sellers" value={String(stats.sellers)} tone="secondary" />
            <StatCard icon="inventory_2" label="Products" value={String(stats.products)} tone="tertiary" />
            <StatCard icon="payments" label="GMV" value={formatBDT(stats.revenue)} tone="primary" />
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="card p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-ink">GMV · last 7 days</h2>
                <span className="text-xs text-secondary">৳ BDT</span>
              </div>
              <BarChart data={revenueSeries} />
            </div>
            <div className="card p-4">
              <h2 className="mb-4 font-display text-base font-bold text-ink">Catalog by category</h2>
              <ShareList data={categoryShare} tone="tertiary" />
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <h2 className="font-display text-base font-bold text-ink">Recent orders</h2>
              <button onClick={() => setTab("orders")} className="text-xs font-medium text-secondary hover:underline">View all</button>
            </div>
            <div className="divide-y divide-line">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{o.orderNo}</div>
                    <div className="text-[11px] text-muted">{o.customerName} · {formatDate(o.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={o.status} />
                    <span className="font-display text-sm font-bold text-ink">{formatBDT(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <Table title="Users" head={["Name", "Email", "Role", "Joined"]}>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-high/40">
              <td className="p-3 font-semibold text-ink">{u.name}</td>
              <td className="p-3 text-muted">{u.email}</td>
              <td className="p-3"><span className="chip bg-high text-muted">{u.role}</span></td>
              <td className="p-3 text-muted">{formatDate(u.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "sellers" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Sellers</h1>
          <div className="grid gap-3 sm:grid-cols-2">
            {shops.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-ink">{s.name}</span>
                    {s.verified && <Icon name="verified" filled className="text-sm text-secondary" />}
                  </div>
                  <span className="chip bg-high text-muted">{s.productCount} products</span>
                </div>
                <div className="mt-1 text-xs text-muted">{s.location}</div>
                <div className="mt-2 flex items-center gap-1">
                  <Rating value={s.rating} hideCount />
                  <span className="text-[11px] text-muted">seller rating</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">Seller requests</h1>
            <p className="text-sm text-muted">
              Approve a seller to grant dashboard access and create their shop, or
              decline to keep the account as a normal customer.
            </p>
          </div>
          {sellerRequests.length === 0 ? (
            <div className="card p-8 text-center text-sm text-muted">
              No pending seller applications.
            </div>
          ) : (
            sellerRequests.map((r) => (
              <div
                key={r.id}
                className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                    {initials(r.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-bold text-ink">{r.name}</span>
                      <span className="chip bg-tertiary/15 text-tertiary">Pending approval</span>
                    </div>
                    <div className="truncate text-xs text-muted">{r.email}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      Shop: <span className="text-ink">{r.shopName ?? "—"}</span> · Requested {formatDate(r.requestedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <form action={approveSellerAction}>
                    <input type="hidden" name="userId" value={r.id} />
                    <button className="btn btn-primary btn-sm">
                      <Icon name="check_circle" className="text-sm" />
                      Approve
                    </button>
                  </form>
                  <form action={rejectSellerAction}>
                    <input type="hidden" name="userId" value={r.id} />
                    <button className="btn btn-outline btn-sm">
                      <Icon name="cancel" className="text-sm" />
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "products" && (
        <Table title="Products" head={["Product", "Seller", "Category", "Price", "Stock"]}>
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-high/40">
              <td className="p-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image src={p.image} alt={p.name} fill sizes="36px" className="object-cover" />
                  </div>
                  <span className="line-clamp-1 font-semibold text-ink">{p.name}</span>
                </div>
              </td>
              <td className="p-3 text-muted">{p.shopName}</td>
              <td className="p-3 text-muted">{p.categoryName}</td>
              <td className="p-3 font-semibold text-ink">{formatBDT(p.price)}</td>
              <td className={cn("p-3", p.stock < 10 ? "text-tertiary" : "text-muted")}>{p.stock}</td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "categories" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Categories</h1>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((c) => (
              <div key={c.id} className="card p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-soft">
                  <Icon name={c.icon} className="text-lg" />
                </span>
                <div className="mt-2 font-display text-sm font-bold text-ink">{c.name}</div>
                <div className="text-xs text-muted">{c.count} products</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <Table title="Orders" head={["Order", "Customer", "Date", "Status", "Total"]}>
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-high/40">
              <td className="p-3 font-semibold text-ink">{o.orderNo}</td>
              <td className="p-3 text-muted">{o.customerName}</td>
              <td className="p-3 text-muted">{formatDate(o.createdAt)}</td>
              <td className="p-3"><StatusPill status={o.status} /></td>
              <td className="p-3 font-semibold text-ink">{formatBDT(o.total)}</td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "reviews" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Reviews</h1>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{r.author} · <span className="text-muted">{r.productName}</span></span>
                  <Rating value={r.rating} hideCount />
                </div>
                <p className="mt-1 text-sm text-muted">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "complaints" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Complaints</h1>
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="card flex items-start justify-between gap-3 p-4">
                <div>
                  <div className="text-sm font-semibold text-ink">{c.subject}</div>
                  <p className="mt-1 text-sm text-muted">{c.message}</p>
                </div>
                <span className={cn("chip", c.status === "OPEN" ? "bg-danger/15 text-danger" : "bg-secondary/15 text-secondary")}>
                  {c.status}
                </span>
              </div>
            ))}
            {complaints.length === 0 && <div className="card p-8 text-center text-sm text-muted">No complaints. Great!</div>}
          </div>
        </div>
      )}

      {tab === "coupons" && (
        <Table title="Coupons" head={["Code", "Type", "Value", "Min spend", "Uses", "Status"]}>
          {coupons.map((c) => (
            <tr key={c.code} className="hover:bg-high/40">
              <td className="p-3 font-mono font-semibold text-ink">{c.code}</td>
              <td className="p-3 text-muted">{c.type}</td>
              <td className="p-3 text-ink">{c.type === "PERCENT" ? `${c.value}%` : formatBDT(c.value)}</td>
              <td className="p-3 text-muted">{formatBDT(c.minSpend)}</td>
              <td className="p-3 text-muted">{c.uses}</td>
              <td className="p-3"><span className={cn("chip", c.active ? "bg-secondary/15 text-secondary" : "bg-high text-muted")}>{c.active ? "Active" : "Paused"}</span></td>
            </tr>
          ))}
        </Table>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Analytics</h1>
          <div className="grid gap-3 lg:grid-cols-3">
            <StatCard icon="payments" label="GMV" value={formatBDT(stats.revenue)} />
            <StatCard icon="receipt_long" label="Orders" value={String(stats.orders)} tone="secondary" />
            <StatCard icon="schedule" label="Pending" value={String(stats.pending)} tone="tertiary" />
          </div>
          <div className="card p-4">
            <h2 className="mb-4 font-display text-base font-bold text-ink">GMV trend</h2>
            <BarChart data={revenueSeries} height={180} />
          </div>
          <div className="card p-4">
            <h2 className="mb-4 font-display text-base font-bold text-ink">Catalog share</h2>
            <ShareList data={categoryShare} tone="tertiary" />
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Platform settings</h1>
          <div className="card divide-y divide-line">
            {[
              ["Escrow protection", "All marketplace transactions", true],
              ["Seller auto-verification", "Require manual review", false],
              ["Cash on delivery", "Enable COD nationwide", true],
              ["Maintenance mode", "Pause storefront", false],
            ].map(([label, desc, on]) => (
              <div key={String(label)} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm font-semibold text-ink">{label}</div>
                  <div className="text-xs text-muted">{desc}</div>
                </div>
                <span className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-high")}>
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all", on ? "left-[22px]" : "left-0.5")} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Table({ title, head, children }: { title: string; head: string[]; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
            <tr>{head.map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
