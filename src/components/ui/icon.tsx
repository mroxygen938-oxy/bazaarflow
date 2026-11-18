import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function Icon({
  name,
  className,
  filled,
  style,
  weight,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
  weight?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", filled && "filled", className)}
      style={
        weight
          ? { ...style, fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" ${weight}, "GRAD" 0, "opsz" 24` }
          : style
      }
    >
      {name}
    </span>
  );
}
