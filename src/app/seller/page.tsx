import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import {
  SellerDashboard,
  type SellerCoupon,
  type SellerOrder,
  type SellerProduct,
  type SellerReview,
} from "@/components/dashboard/seller-dashboard";
import type { Point } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Seller Dashboard" };

export default async function SellerPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirectTo=/seller");

  const account = await db.user.findUnique({
    where: { id: session.id },
    select: { role: true, sellerStatus: true, requestedShopName: true, sellerRequestedAt: true },
  });
  if (!account) redirect("/login?redirectTo=/seller");

  if (account.role !== "SELLER" && account.role !== "ADMIN") {
    const applicant = account;

    if (applicant?.sellerStatus === "PENDING") {
      return (
        <div className="container-page py-16">
          <div className="mx-auto max-w-lg rounded-3xl border border-line bg-surface p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-tertiary/15 text-tertiary">
              <Icon name="hourglass_top" className="text-3xl" />
            </div>
            <span className="chip mt-4 bg-tertiary/15 text-tertiary">
              <Icon name="schedule" className="text-sm" />
              Pending approval
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold text-ink">
              Application under review
            </h1>
            <p className="mt-2 text-sm text-muted">
              Thanks, {session.name.split(" ")[0]}. Your seller request
              {applicant.requestedShopName
                ? ` for “${applicant.requestedShopName}”`
                : ""}{" "}
              was sent to the admin team. Please wait for admin approval —
              you&apos;ll be notified once it&apos;s reviewed. Until then your
              account stays a normal customer account.
            </p>

            <div className="mt-6 space-y-3 text-left">
              {[
                { icon: "check_circle", label: "Account created", done: true },
                { icon: "hourglass_top", label: "Admin review in progress", done: false },
                { icon: "storefront", label: "Start selling once approved", done: false },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      step.done
                        ? "bg-secondary/15 text-secondary"
                        : "bg-high text-muted"
                    }`}
                  >
                    {step.done ? <Icon name="check" className="text-sm" /> : i + 1}
                  </span>
                  <span className={`text-sm ${step.done ? "text-ink" : "text-muted"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-2">
              <Link href="/explore" className="btn btn-primary">Browse marketplace</Link>
              <Link href="/account" className="btn btn-secondary">My account</Link>
            </div>
            {applicant.sellerRequestedAt && (
              <p className="mt-4 text-[11px] text-muted">
                Submitted {formatDate(applicant.sellerRequestedAt)}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (applicant?.sellerStatus === "REJECTED") {
      return (
        <div className="container-page py-16">
          <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/15 text-danger">
              <Icon name="cancel" className="text-3xl" />
            </div>
            <span className="chip mt-4 bg-danger/15 text-danger">Not approved</span>
            <h1 className="mt-3 font-display text-2xl font-bold text-ink">
              Seller application declined
            </h1>
            <p className="mt-2 text-sm text-muted">
              Your request to sell on BAZAARFLOW was not approved by the admin
              team. Your account remains a normal customer account — you can
              still shop as usual.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Link href="/explore" className="btn btn-primary">Browse marketplace</Link>
              <Link href="/account" className="btn btn-secondary">My account</Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary-soft">
            <Icon name="storefront" className="text-3xl" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Seller access required</h1>
          <p className="mt-2 text-sm text-muted">
            This workspace is for verified sellers. Register a seller account to open your shop.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link href="/register?role=SELLER" className="btn btn-primary">Become a seller</Link>
            <Link href="/account" className="btn btn-secondary">My dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const shop =
    (await db.shop.findFirst({ where: { ownerId: session.id } })) ??
    (account.role === "ADMIN" ? await db.shop.findFirst() : null);

  if (!shop) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary-soft">
            <Icon name="add_business" className="text-3xl" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Set up your shop</h1>
          <p className="mt-2 text-sm text-muted">You have not created a shop yet. Finish onboarding to start selling.</p>
          <Link href="/account" className="btn btn-primary mt-6">Go to dashboard</Link>
        </div>
      </div>
    );
  }

  const [products, categories, brands, coupons] = await Promise.all([
    db.product.findMany({
      where: { shopId: shop.id },
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ select: { id: true, name: true } }),
    db.brand.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    db.coupon.findMany({ orderBy: { code: "asc" } }),
  ]);

  const productIds = products.map((p) => p.id);
  const productCategory = new Map(products.map((p) => [p.id, p.category.name]));

  const orders = await db.order.findMany({
    where: productIds.length ? { items: { some: { productId: { in: productIds } } } } : { id: "__none__" },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const reviews = await db.review.findMany({
    where: { productId: { in: productIds.length ? productIds : ["__none__"] } },
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  // Analytics
  const shopItemsTotal = (order: (typeof orders)[number]) =>
    order.items
      .filter((it) => it.productId && productIds.includes(it.productId))
      .reduce((a, b) => a + b.price * b.quantity, 0);

  const revenue = orders.reduce((a, o) => a + shopItemsTotal(o), 0);
  const pending = orders.filter((o) => ["PENDING", "PROCESSING"].includes(o.status)).length;

  const days: Point[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-GB", { weekday: "short" });
    const value = orders
      .filter((o) => o.createdAt.toDateString() === d.toDateString())
      .reduce((a, o) => a + shopItemsTotal(o), 0);
    days.push({ label, value });
  }

  const shareMap = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      if (!it.productId || !productIds.includes(it.productId)) continue;
      const cat = productCategory.get(it.productId) ?? "Other";
      shareMap.set(cat, (shareMap.get(cat) ?? 0) + it.price * it.quantity);
    }
  }
  const categoryShare: Point[] = [...shareMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const sellerOrders: SellerOrder[] = orders.map((o) => ({
    id: o.id,
    orderNo: o.orderNo,
    customerName: o.customerName,
    status: o.status,
    total: shopItemsTotal(o) || o.total,
    createdAt: o.createdAt.toISOString(),
    items: o.items
      .filter((it) => it.productId && productIds.includes(it.productId))
      .map((it) => ({ name: it.name, quantity: it.quantity, image: it.image })),
  }));

  const sellerProducts: SellerProduct[] = products.map((p) => {
    let specs: Record<string, string> = {};
    try {
      specs = JSON.parse(p.specs ?? "{}");
    } catch {
      specs = {};
    }
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      subtitle: p.subtitle,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice,
      image: p.image,
      stock: p.stock,
      rating: p.rating,
      reviewCount: p.reviewCount,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      brandName: p.brand?.name ?? "",
      warranty: specs.Warranty ?? "12-month warranty",
      badge: p.badge,
    };
  });

  const sellerReviews: SellerReview[] = reviews.map((r) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    title: r.title,
    body: r.body,
    productName: r.product.name,
    createdAt: formatDate(r.createdAt),
  }));

  const sellerCoupons: SellerCoupon[] = coupons.map((c) => ({
    code: c.code,
    type: c.type,
    value: c.value,
    minSpend: c.minSpend,
    active: c.active,
    uses: c.uses,
  }));

  return (
    <SellerDashboard
      shop={{
        name: shop.name,
        tagline: shop.tagline,
        description: shop.description,
        location: shop.location,
        rating: shop.rating,
        totalSales: shop.totalSales,
        initials: shop.initials,
      }}
      products={sellerProducts}
      orders={sellerOrders}
      reviews={sellerReviews}
      coupons={sellerCoupons}
      categories={categories}
      brands={brands.map((b) => b.name)}
      revenueSeries={days}
      categoryShare={categoryShare.length ? categoryShare : [{ label: "No sales yet", value: 1 }]}
      revenue={revenue}
      pending={pending}
    />
  );
}
