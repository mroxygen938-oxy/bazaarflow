import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { productInclude, toCard } from "@/lib/product-view";
import {
  AccountDashboard,
  type AccountAlert,
  type AccountAddress,
  type AccountNotification,
  type AccountOrder,
} from "@/components/dashboard/account-dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?redirectTo=/account");
  const { tab } = await searchParams;

  const [user, orders, addresses, alerts, notifications, recent] = await Promise.all([
    db.user.findUnique({ where: { id: session.id } }),
    db.order.findMany({
      where: { userId: session.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    db.address.findMany({ where: { userId: session.id } }),
    db.priceAlert.findMany({
      where: { userId: session.id },
      include: { product: { select: { name: true, image: true, slug: true, price: true } } },
    }),
    db.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({ where: { trending: true }, include: productInclude, take: 4 }),
  ]);

  if (!user) redirect("/login");

  const orderData: AccountOrder[] = orders.map((o) => ({
    id: o.id,
    orderNo: o.orderNo,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    discount: o.discount,
    total: o.total,
    paymentMethod: o.paymentMethod,
    items: o.items.map((it) => ({
      id: it.id,
      name: it.name,
      image: it.image,
      price: it.price,
      quantity: it.quantity,
    })),
  }));

  const addressData: AccountAddress[] = addresses.map((a) => ({
    id: a.id,
    label: a.label,
    fullName: a.fullName,
    phone: a.phone,
    street: a.street,
    area: a.area,
    city: a.city,
    postal: a.postal,
    isDefault: a.isDefault,
  }));

  const alertData: AccountAlert[] = alerts.map((a) => ({
    id: a.id,
    targetPrice: a.targetPrice,
    product: {
      name: a.product.name,
      image: a.product.image,
      slug: a.product.slug,
      price: a.product.price,
    },
  }));

  const notifData: AccountNotification[] = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    kind: n.kind,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <AccountDashboard
      user={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
      orders={orderData}
      addresses={addressData}
      alerts={alertData}
      notifications={notifData}
      recent={recent.map((p) => toCard(p))}
      initialTab={tab}
    />
  );
}
