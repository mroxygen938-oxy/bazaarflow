import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  let defaults = null;

  if (session) {
    const address = await db.address.findFirst({
      where: { userId: session.id },
      orderBy: { isDefault: "desc" },
    });
    defaults = {
      name: session.name,
      email: session.email,
      phone: address?.phone ?? "",
      address: address?.street ?? "",
      area: address?.area ?? "",
      city: address?.city ?? "Dhaka",
    };
  }

  return <CheckoutForm defaults={defaults} />;
}
