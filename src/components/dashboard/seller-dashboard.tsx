"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { cn, formatBDT, formatDate } from "@/lib/utils";
import { useToast } from "@/store/providers";
import {
  createProductAction,
  updateOrderStatusAction,
  updateProductAction,
  updateShopAction,
  type ActionState,
} from "@/app/actions/seller";
import { Icon } from "@/components/ui/icon";
import { Rating } from "@/components/ui/misc";
import {
  DashboardShell,
  StatCard,
  StatusPill,
  type DashNavItem,
} from "@/components/dashboard/dashboard-shell";
import { BarChart, ShareList, type Point } from "@/components/dashboard/charts";

export type SellerProduct = {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string;
  stock: number;
  rating: number;
  reviewCount: number;
  categoryId: string;
  categoryName: string;
  brandName: string;
  warranty: string;
  badge: string | null;
};
export type SellerOrder = {
  id: string;
  orderNo: string;
  customerName: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number; image: string }[];
};
export type SellerReview = {
  id: string;
  author: string;
  rating: number;
  title: string | null;
  body: string;
  productName: string;
  createdAt: string;
};
export type SellerCoupon = { code: string; type: string; value: number; minSpend: number; active: boolean; uses: number };
export type SellerShop = {
  name: string;
  tagline: string | null;
  description: string | null;
  location: string;
  rating: number;
  totalSales: number;
  initials: string;
};

const tabs: DashNavItem[] = [
  { key: "overview", label: "Overview", icon: "dashboard" },
  { key: "products", label: "Products", icon: "inventory_2" },
  { key: "add", label: "Add Product", icon: "add_box" },
  { key: "orders", label: "Orders", icon: "receipt_long" },
  { key: "inventory", label: "Inventory", icon: "warehouse" },
  { key: "analytics", label: "Sales Analytics", icon: "insights" },
  { key: "reviews", label: "Reviews", icon: "reviews" },
  { key: "discounts", label: "Discounts", icon: "local_offer" },
  { key: "settings", label: "Shop Settings", icon: "storefront" },
];

export function SellerDashboard({
  shop,
  products,
  orders,
  reviews,
  coupons,
  categories,
  brands,
  revenueSeries,
  categoryShare,
  revenue,
  pending,
}: {
  shop: SellerShop;
  products: SellerProduct[];
  orders: SellerOrder[];
  reviews: SellerReview[];
  coupons: SellerCoupon[];
  categories: { id: string; name: string }[];
  brands: string[];
  revenueSeries: Point[];
  categoryShare: Point[];
  revenue: number;
  pending: number;
}) {
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState<SellerProduct | null>(null);
  const { toast } = useToast();

  const nav = tabs.map((t) =>
    t.key === "orders" ? { ...t, badge: pending } : t,
  );

  return (
    <DashboardShell
      role="Seller dashboard"
      user={{ name: shop.name, email: "Seller workspace", role: "SELLER" }}
      nav={nav}
      active={tab}
      onActive={setTab}
    >
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">{shop.name}</h1>
              <p className="text-sm text-muted">{shop.tagline ?? shop.location}</p>
            </div>
            <span className="chip bg-secondary/15 text-secondary">
              <Icon name="verified" className="text-sm" /> Verified shop
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon="payments" label="Total revenue" value={formatBDT(revenue)} />
            <StatCard icon="receipt_long" label="Total orders" value={String(orders.length)} tone="secondary" />
            <StatCard icon="inventory_2" label="Total products" value={String(products.length)} tone="tertiary" />
            <StatCard icon="schedule" label="Pending orders" value={String(pending)} tone="danger" />
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="card p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-ink">Revenue · last 7 days</h2>
                <span className="text-xs text-secondary">৳ BDT</span>
              </div>
              <BarChart data={revenueSeries} />
            </div>
            <div className="card p-4">
              <h2 className="mb-4 font-display text-base font-bold text-ink">Category share</h2>
              <ShareList data={categoryShare} tone="secondary" />
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
                  <div className="min-w-0">
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

      {tab === "products" && editing && (
        <EditProduct
          product={editing}
          categories={categories}
          brands={brands}
          onDone={() => setEditing(null)}
        />
      )}

      {tab === "products" && !editing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
            <button onClick={() => setTab("add")} className="btn btn-primary btn-sm">
              <Icon name="add" className="text-sm" /> Add product
            </button>
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-high/40">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-canvas">
                          <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="line-clamp-1 font-semibold text-ink">{p.name}</div>
                          <div className="text-[11px] text-muted">{p.categoryName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-ink">{formatBDT(p.price)}</td>
                    <td className={cn("p-3", p.stock < 10 ? "text-tertiary" : "text-muted")}>{p.stock}</td>
                    <td className="p-3"><Rating value={p.rating} hideCount /></td>
                    <td className="p-3">
                      <span className={cn("chip", p.stock > 0 ? "bg-secondary/15 text-secondary" : "bg-danger/15 text-danger")}>
                        {p.stock > 0 ? "Live" : "Out of stock"}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setEditing(p)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Icon name="edit" className="text-sm" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "add" && <AddProduct categories={categories} brands={brands} />}

      {tab === "orders" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
          {orders.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-ink">{o.orderNo}</span>
                    <StatusPill status={o.status} />
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">{o.customerName} · {formatDate(o.createdAt)}</div>
                </div>
                <span className="font-display text-base font-bold text-ink">{formatBDT(o.total)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.items.map((it, i) => (
                  <span key={i} className="chip bg-high text-muted">
                    <Icon name="inventory_2" className="text-sm" />
                    {it.name} ×{it.quantity}
                  </span>
                ))}
              </div>
              <form action={updateOrderStatusAction} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="orderId" value={o.id} />
                <select name="status" defaultValue={o.status} className="input h-9 max-w-[180px] text-sm">
                  {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button className="btn btn-secondary btn-sm">Update status</button>
              </form>
            </div>
          ))}
        </div>
      )}

      {tab === "inventory" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Inventory</h1>
          <div className="grid gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <div key={p.id} className={cn("card p-3", p.stock < 10 && "border-tertiary/40")}>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 text-sm font-semibold text-ink">{p.name}</div>
                    <div className="text-[11px] text-muted">{p.categoryName}</div>
                  </div>
                  <span className={cn("chip", p.stock < 10 ? "bg-tertiary/15 text-tertiary" : "bg-secondary/15 text-secondary")}>
                    {p.stock} left
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => toast(`Restock request logged for ${p.name}.`, "info")} className="btn btn-secondary btn-sm w-full">
                    <Icon name="add_box" className="text-sm" /> Restock
                  </button>
                  <button
                    onClick={() => {
                      setEditing(p);
                      setTab("products");
                    }}
                    className="btn btn-outline btn-sm w-full"
                  >
                    <Icon name="edit" className="text-sm" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Sales analytics</h1>
          <div className="grid gap-3 lg:grid-cols-3">
            <StatCard icon="trending_up" label="Revenue (total)" value={formatBDT(revenue)} />
            <StatCard icon="shopping_bag" label="Avg. order value" value={formatBDT(orders.length ? revenue / orders.length : 0)} tone="secondary" />
            <StatCard icon="reviews" label="Avg. rating" value={shop.rating.toFixed(2)} tone="tertiary" />
          </div>
          <div className="card p-4">
            <h2 className="mb-4 font-display text-base font-bold text-ink">Revenue trend</h2>
            <BarChart data={revenueSeries} height={180} />
          </div>
          <div className="card p-4">
            <h2 className="mb-4 font-display text-base font-bold text-ink">Sales by category</h2>
            <ShareList data={categoryShare} tone="primary" />
          </div>
        </div>
      )}

      {tab === "reviews" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Reviews</h1>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-high text-xs font-bold text-ink">
                      {r.author.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-ink">{r.author}</div>
                      <div className="text-[11px] text-muted">{r.productName}</div>
                    </div>
                  </div>
                  <Rating value={r.rating} hideCount />
                </div>
                {r.title && <p className="mt-2 text-sm font-semibold text-ink">{r.title}</p>}
                <p className="mt-1 text-sm text-muted">{r.body}</p>
              </div>
            ))}
            {reviews.length === 0 && <div className="card p-8 text-center text-sm text-muted">No reviews yet.</div>}
          </div>
        </div>
      )}

      {tab === "discounts" && (
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-bold text-ink">Discounts & coupons</h1>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Min spend</th>
                  <th className="p-3">Uses</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {coupons.map((c) => (
                  <tr key={c.code} className="hover:bg-high/40">
                    <td className="p-3 font-mono font-semibold text-ink">{c.code}</td>
                    <td className="p-3 text-muted">{c.type}</td>
                    <td className="p-3 text-ink">{c.type === "PERCENT" ? `${c.value}%` : formatBDT(c.value)}</td>
                    <td className="p-3 text-muted">{formatBDT(c.minSpend)}</td>
                    <td className="p-3 text-muted">{c.uses}</td>
                    <td className="p-3">
                      <span className={cn("chip", c.active ? "bg-secondary/15 text-secondary" : "bg-high text-muted")}>
                        {c.active ? "Active" : "Paused"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "settings" && <ShopSettings shop={shop} />}
    </DashboardShell>
  );
}

function AddProduct({
  categories,
  brands,
}: {
  categories: { id: string; name: string }[];
  brands: string[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createProductAction, null);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Add product</h1>
      <div className="card p-5">
        <form action={action} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Product name</label>
              <input name="name" required placeholder="e.g. Keychron Q5 Pro" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Short subtitle</label>
              <input name="subtitle" placeholder="One-line selling point" className="input" />
            </div>
            <div>
              <label className="label">Price (৳)</label>
              <input name="price" type="number" min="1" required placeholder="23900" className="input" />
            </div>
            <div>
              <label className="label">Compare-at price (optional)</label>
              <input name="oldPrice" type="number" min="0" placeholder="27500" className="input" />
            </div>
            <div>
              <label className="label">Stock</label>
              <input name="stock" type="number" min="0" defaultValue={20} className="input" />
            </div>
            <div>
              <label className="label">Category</label>
              <select name="categoryId" required className="input">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <input name="brandName" list="brand-options" placeholder="e.g. Keychron" className="input" />
              <datalist id="brand-options">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">Warranty</label>
              <input
                name="warranty"
                defaultValue="12-month official warranty"
                placeholder="e.g. 12-month official warranty"
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Product photo</label>
              <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-3 sm:flex-row sm:items-center">
                <div
                  className="h-20 w-20 shrink-0 rounded-lg border border-line bg-cover bg-center"
                  style={{ backgroundImage: `url(${preview ?? "/images/product-placeholder.svg"})` }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <input
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setPreview(f ? URL.createObjectURL(f) : null);
                    }}
                    className="input file:mr-3 file:rounded-md file:border-0 file:bg-high file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    Optional · JPG, PNG, WebP, GIF or AVIF · up to 5 MB. If you
                    don&apos;t upload a photo, a branded BAZAARFLOW placeholder is used.
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea name="description" rows={3} placeholder="Describe the product…" className="input" />
            </div>
          </div>
          {state?.error && <p className="text-xs text-danger">{state.error}</p>}
          {state?.success && <p className="text-xs text-secondary">{state.success}</p>}
          <button disabled={pending} className="btn btn-primary">
            {pending ? "Publishing…" : "Publish product"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditProduct({
  product,
  categories,
  brands,
  onDone,
}: {
  product: SellerProduct;
  categories: { id: string; name: string }[];
  brands: string[];
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateProductAction, null);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <button
            type="button"
            onClick={onDone}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
          >
            <Icon name="arrow_back" className="text-sm" />
            Back to products
          </button>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">Edit product</h1>
          <p className="text-sm text-muted">{product.name}</p>
        </div>
        <span className="chip bg-high text-muted">{product.categoryName}</span>
      </div>

      <div className="card p-5">
        <form action={action} className="space-y-3">
          <input type="hidden" name="productId" value={product.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Product name</label>
              <input name="name" required defaultValue={product.name} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Short subtitle</label>
              <input name="subtitle" defaultValue={product.subtitle ?? ""} className="input" />
            </div>
            <div>
              <label className="label">Price (৳)</label>
              <input name="price" type="number" min="1" required defaultValue={product.price} className="input" />
            </div>
            <div>
              <label className="label">Compare-at price (optional)</label>
              <input name="oldPrice" type="number" min="0" defaultValue={product.oldPrice ?? ""} className="input" />
            </div>
            <div>
              <label className="label">Stock</label>
              <input name="stock" type="number" min="0" defaultValue={product.stock} className="input" />
            </div>
            <div>
              <label className="label">Category</label>
              <select name="categoryId" required defaultValue={product.categoryId} className="input">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <input
                name="brandName"
                list="brand-options-edit"
                defaultValue={product.brandName}
                placeholder="e.g. Keychron"
                className="input"
              />
              <datalist id="brand-options-edit">
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">Warranty</label>
              <input name="warranty" defaultValue={product.warranty} className="input" />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Product photo</label>
              <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-3 sm:flex-row sm:items-center">
                <div
                  className="h-20 w-20 shrink-0 rounded-lg border border-line bg-cover bg-center"
                  style={{ backgroundImage: `url(${preview ?? product.image})` }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <input
                    name="image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setPreview(f ? URL.createObjectURL(f) : null);
                    }}
                    className="input file:mr-3 file:rounded-md file:border-0 file:bg-high file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink"
                  />
                  <p className="mt-1 text-[11px] text-muted">
                    Leave empty to keep the current image. Max 5 MB, JPG/PNG/WebP/GIF/AVIF.
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea
                name="description"
                rows={3}
                defaultValue={product.description ?? ""}
                className="input"
              />
            </div>
          </div>

          {state?.error && <p className="text-xs text-danger">{state.error}</p>}
          {state?.success && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2">
              <span className="text-xs text-secondary">{state.success}</span>
              <button type="button" onClick={onDone} className="text-xs font-semibold text-secondary hover:underline">
                Done
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button disabled={pending} className="btn btn-primary">
              {pending ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={onDone} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShopSettings({ shop }: { shop: SellerShop }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateShopAction, null);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-ink">Shop settings</h1>
      <div className="card p-5">
        <form action={action} className="space-y-3">
          <div>
            <label className="label">Shop name</label>
            <input name="name" defaultValue={shop.name} className="input" />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input name="tagline" defaultValue={shop.tagline ?? ""} className="input" />
          </div>
          <div>
            <label className="label">Location</label>
            <input name="location" defaultValue={shop.location} className="input" />
          </div>
          {state?.error && <p className="text-xs text-danger">{state.error}</p>}
          {state?.success && <p className="text-xs text-secondary">{state.success}</p>}
          <button disabled={pending} className="btn btn-primary">
            {pending ? "Saving…" : "Save shop"}
          </button>
        </form>
      </div>
    </div>
  );
}
