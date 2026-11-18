import type { ReactNode } from "react";
import { cn, formatBDT } from "@/lib/utils";
import { Icon } from "./icon";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "primary" | "secondary" | "tertiary" | "success" | "danger" | "neutral";
  className?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/15 text-primary-soft border border-primary/25",
    secondary: "bg-secondary/15 text-secondary border border-secondary/30",
    tertiary: "bg-tertiary/15 text-tertiary border border-tertiary/25",
    success: "bg-secondary/15 text-secondary border border-secondary/30",
    danger: "bg-danger/15 text-danger border border-danger/30",
    neutral: "bg-white/5 text-muted border border-line",
  };
  return (
    <span className={cn("chip", tones[tone], className)}>{children}</span>
  );
}

export function Rating({
  value,
  count,
  size = "sm",
  hideCount,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  hideCount?: boolean;
}) {
  const px = size === "md" ? "text-base" : "text-xs";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-flex text-tertiary", px)}>
        <Icon name="star" filled className={px} />
      </span>
      <span className={cn("font-semibold text-ink", size === "md" ? "text-sm" : "text-xs")}>
        {value.toFixed(1)}
      </span>
      {!hideCount && count != null && (
        <span className="text-xs text-muted">({count})</span>
      )}
    </span>
  );
}

export function Price({
  value,
  oldPrice,
  size = "md",
}: {
  value: number;
  oldPrice?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const main = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-xl";
  return (
    <div className="flex flex-col">
      <span
        className={cn("font-display font-bold tabular-nums text-ink", main)}
      >
        {formatBDT(value)}
      </span>
      {oldPrice && oldPrice > value && (
        <span className="text-xs text-muted line-through tabular-nums">
          {formatBDT(oldPrice)}
        </span>
      )}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  eyebrowTone = "primary",
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  eyebrowIcon?: string;
  eyebrowTone?: "primary" | "secondary" | "tertiary";
  title: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  const toneMap = {
    primary: "text-primary-soft",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
  };
  return (
    <div className={cn("mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <div className={cn("mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]", toneMap[eyebrowTone])}>
            {eyebrowIcon && <Icon name={eyebrowIcon} className="text-base" />}
            <span>{eyebrow}</span>
          </div>
        )}
        <h2 className="font-display text-2xl font-bold text-ink md:text-3xl lg:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm text-muted md:text-base">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-high text-muted">
        <Icon name={icon} className="text-3xl" />
      </div>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "gradient",
  className,
}: {
  value: number;
  tone?: "gradient" | "secondary" | "tertiary" | "danger";
  className?: string;
}) {
  const tones: Record<string, string> = {
    gradient: "bg-gradient-to-r from-primary to-secondary",
    secondary: "bg-secondary",
    tertiary: "bg-tertiary",
    danger: "bg-danger",
  };
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-high", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}
