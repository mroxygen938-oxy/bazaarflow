"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string; success?: string } | null;

function dashboardFor(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/seller";
  return "/account";
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password to continue." };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found with that email." };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Incorrect password. Please try again." };

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "CUSTOMER" | "SELLER" | "ADMIN",
  });

  redirect(dashboardFor(user.role));
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const wantsSeller = String(formData.get("role") ?? "CUSTOMER") === "SELLER";
  const shopName = String(formData.get("shopName") ?? "").trim();

  if (name.length < 2) return { error: "Tell us your name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
      sellerStatus: wantsSeller ? "PENDING" : "NONE",
      sellerRequestedAt: wantsSeller ? new Date() : null,
      requestedShopName: wantsSeller ? shopName || `${name}'s Shop` : null,
    },
  });

  if (wantsSeller) {
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          title: "New seller application",
          body: `${name} applied to sell${
            shopName ? ` under “${shopName}”` : ""
          }. Review the request in the admin console.`,
          kind: "seller",
        })),
      });
    }
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: "CUSTOMER",
  });

  if (wantsSeller) redirect("/seller?applied=1");
  redirect("/account");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { getSession } = await import("@/lib/auth");
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (name.length < 2) return { error: "Enter your full name." };

  await db.user.update({
    where: { id: session.id },
    data: { name, phone: phone || null },
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/account");
  return { success: "Profile updated successfully." };
}
