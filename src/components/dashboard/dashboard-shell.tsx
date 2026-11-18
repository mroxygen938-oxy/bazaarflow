"use client";

import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export type DashNavItem = {
  key: string;
  label: string;
  icon: string;
  badge?: number;
};

export type DashUser = {
  name: string;
  email: string;
  role: string;
};

export function DashboardShell({
  role,
  user,
  nav,
  active,
  onActive,
  children,
}: {
  role: string;
  user: DashUser;
  nav: DashNavItem[];
  active: string;
  onActive: (key: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="container-page py-8">
      <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-24 p-3">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-canvas p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-ink">{user.name}</div>
                <div className="truncate text-[11px] text-muted">{user.email}</div>
              </div>
            </div>
            <div className="mb-2 px-1">
              <span className="chip bg-primary/15 text-primary-soft">{role}</span>
            </div>
            <nav className="space-y-0.5">
              {nav.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onActive(item.key)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active === item.key
                      ? "bg-primary/10 text-ink"
                      : "text-muted hover:bg-high hover:text-ink",
                  )}
                >
                  <Icon name={item.icon} className="text-lg" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar lg:hidden">
            {nav.map((item) => (
              <button
                key={item.key}
                onClick={() => onActive(item.key)}
                className={cn(
                  "chip shrink-0",
                  active === item.key ? "bg-primary text-white" : "bg-high text-muted",
                )}
              >
                <Icon name={item.icon} className="text-sm" />
                {item.label}
              </button>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  tone = "primary",
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  tone?: "primary" | "secondary" | "tertiary" | "danger";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/15 text-primary-soft",
    secondary: "bg-secondary/15 text-secondary",
    tertiary: "bg-tertiary/15 text-tertiary",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tones[tone])}>
          <Icon name={icon} className="text-lg" />
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-ink">{value}</div>
      <div className="text-xs text-muted">{label}</div>
      {hint && <div className="mt-1 text-[10px] font-medium text-secondary">{hint}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-tertiary/15 text-tertiary border-tertiary/25",
    PROCESSING: "bg-primary/15 text-primary-soft border-primary/25",
    SHIPPED: "bg-secondary/15 text-secondary border-secondary/30",
    DELIVERED: "bg-secondary/15 text-secondary border-secondary/30",
    CANCELLED: "bg-danger/15 text-danger border-danger/30",
  };
  const labels: Record<string, string> = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return (
    <span className={cn("chip border", map[status] ?? "bg-high text-muted")}>
      {labels[status] ?? status}
    </span>
  );
}
