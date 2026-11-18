import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export function Logo({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-[0_8px_20px_-8px_rgba(139,114,255,0.8)]">
        <Icon name="auto_awesome" filled className="text-lg" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          BAZAAR<span className="gradient-text">FLOW</span>
        </span>
      )}
    </Link>
  );
}
