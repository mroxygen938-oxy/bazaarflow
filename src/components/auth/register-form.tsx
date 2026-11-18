"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction, type AuthState } from "@/app/actions/auth";
import { Icon } from "@/components/ui/icon";

export function RegisterForm({ initialRole }: { initialRole: "CUSTOMER" | "SELLER" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, null);
  const [role, setRole] = useState(initialRole);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />

      <div className="grid grid-cols-2 gap-2">
        {[
          { value: "CUSTOMER", label: "Shop with us", icon: "shopping_bag" },
          { value: "SELLER", label: "Sell on BAZAARFLOW", icon: "storefront" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRole(opt.value as "CUSTOMER" | "SELLER")}
            className={`rounded-xl border p-3 text-left transition-all ${
              role === opt.value
                ? "border-primary/50 bg-primary/10"
                : "border-line bg-surface hover:border-line-strong"
            }`}
          >
            <Icon name={opt.icon} className="text-lg text-primary-soft" />
            <div className="mt-1 text-xs font-semibold text-ink">{opt.label}</div>
          </button>
        ))}
      </div>

      <div>
        <label className="label">Full name</label>
        <input name="name" required placeholder="Ayesha Karim" className="input" autoComplete="name" />
      </div>

      <div>
        <label className="label">Email</label>
        <input name="email" type="email" required placeholder="you@email.com" className="input" autoComplete="email" />
      </div>

      {role === "SELLER" && (
        <>
          <div>
            <label className="label">Shop name</label>
            <input name="shopName" placeholder="e.g. Nexus Gadgets" className="input" />
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-tertiary/25 bg-tertiary/10 px-3 py-2.5 text-xs text-tertiary">
            <Icon name="verified_user" className="mt-0.5 text-base" />
            <span>
              Seller accounts need admin approval. Until approved, you keep a
              normal customer account and can still shop.
            </span>
          </div>
        </>
      )}

      <div>
        <label className="label">Password</label>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={6}
            placeholder="At least 6 characters"
            className="input pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink"
            aria-label="Toggle password visibility"
          >
            <Icon name={show ? "visibility_off" : "visibility"} className="text-lg" />
          </button>
        </div>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          <Icon name="error" className="text-base" />
          {state.error}
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Creating account…
          </>
        ) : (
          <>
            Create account
            <Icon name="arrow_forward" className="text-base" />
          </>
        )}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-soft hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
