import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Icon } from "@/components/ui/icon";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import type { Point } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Console" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirectTo=/admin");

  if (session.role !== "ADMIN") {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/15 text-danger">
            <Icon name="admin_panel_settings" className="text-3xl" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Administrator access only</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in with an admin account to open the marketplace console.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/login?redirectTo=/admin" className="btn btn-primary">Sign in</Link>
            <Link href="/" className="btn btn-secondary">Back home</Link>
          </div>
        </div>
      </div>
    );
  }

  const [users, shops, products, categories, orders, reviews, complaints, coupons, pendingSellers] =
    await Promise.all([
      db.user.findMany({ orderBy: { createdAt: "desc" } }),
      db.shop.findMany({ include: { _count: { select: { products: true } } } }),
      db.product.findMany({
        include: {
          shop: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.category.findMany({ include: { _count: { select: { products: true } } } }),
      db.order.findMany({ orderBy: { createdAt: "desc" } }),
      db.review.findMany({ include: { product: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
      db.complaint.findMany({ orderBy: { createdAt: "desc" } }),
      db.coupon.findMany({ orderBy: { code: "asc" } }),
      db.user.findMany({
        where: { sellerStatus: "PENDING" },
        orderBy: { sellerRequestedAt: "asc" },
      }),
    ]);

  const revenue = orders.reduce((a, o) => a + o.total, 0);
  const pending = orders.filter((o) => ["PENDING", "PROCESSING"].includes(o.status)).length;

  const revenueSeries: Point[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-GB", { weekday: "short" });
    const value = orders
      .filter((o) => o.createdAt.toDateString() === d.toDateString())
      .reduce((a, o) => a + o.total, 0);
    revenueSeries.push({ label, value });
  }

  const categoryShare: Point[] = categories
    .map((c) => ({ label: c.name, value: c._count.products }))
    .sort((a, b) => b.value - a.value);

  return (
    <AdminDashboard
      stats={{
        users: users.length,
        sellers: shops.length,
        products: products.length,
        orders: orders.length,
        revenue,
        pending,
      }}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      }))}
      shops={shops.map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        rating: s.rating,
        verified: s.verified,
        productCount: s._count.products,
      }))}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        shopName: p.shop.name,
        categoryName: p.category.name,
        image: p.image,
      }))}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        count: c._count.products,
      }))}
      orders={orders.map((o) => ({
        id: o.id,
        orderNo: o.orderNo,
        customerName: o.customerName,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt.toISOString(),
      }))}
      reviews={reviews.map((r) => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        body: r.body,
        productName: r.product.name,
      }))}
      complaints={complaints.map((c) => ({
        id: c.id,
        subject: c.subject,
        message: c.message,
        status: c.status,
      }))}
      coupons={coupons.map((c) => ({
        code: c.code,
        type: c.type,
        value: c.value,
        minSpend: c.minSpend,
        active: c.active,
        uses: c.uses,
      }))}
      revenueSeries={revenueSeries}
      categoryShare={categoryShare}
      sellerRequests={pendingSellers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        shopName: u.requestedShopName,
        requestedAt: (u.sellerRequestedAt ?? u.createdAt).toISOString(),
      }))}
    />
  );
}
