"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import { Icon } from "@/components/ui/icon";

const demos = [
  { label: "Customer", email: "customer@bazaarflow.com" },
  { label: "Seller", email: "seller@bazaarflow.com" },
  { label: "Admin", email: "admin@bazaarflow.com" },
];

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo ?? ""} />

      <div>
        <label className="label">Email</label>
        <input
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="input"
          autoComplete="email"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label">Password</label>
          <button type="button" className="text-xs text-secondary hover:underline">
            Forgot?
          </button>
        </div>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input pr-10"
            autoComplete="current-password"
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
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <Icon name="arrow_forward" className="text-base" />
          </>
        )}
      </button>

      <div className="rounded-xl border border-line bg-surface p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Demo accounts · password123
        </p>
        <div className="flex flex-wrap gap-2">
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => {
                setEmail(d.email);
                setPassword("password123");
              }}
              className="chip bg-high text-ink hover:bg-bright"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted">
        New to BAZAARFLOW?{" "}
        <Link href="/register" className="font-semibold text-primary-soft hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
