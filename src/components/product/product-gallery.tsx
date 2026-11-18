"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const unique = Array.from(new Set(images.filter(Boolean)));
  const [active, setActive] = useState(0);

  return (
    <div className="lg:sticky lg:top-24">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-panel">
        <Image
          src={unique[active] ?? "/images/products/img-12.jpg"}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <span className="absolute left-4 top-4 chip bg-canvas/80 text-secondary backdrop-blur">
          360° studio capture
        </span>
      </div>
      {unique.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {unique.slice(0, 8).map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border transition-all",
                active === i ? "border-primary" : "border-line hover:border-line-strong",
              )}
            >
              <Image src={src} alt={`${alt} view ${i + 1}`} fill sizes="25vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["verified_user", "Escrow protected"],
          ["local_shipping", "Dhaka delivery"],
          ["assignment_return", "7-day returns"],
        ].map(([icon, label]) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-xl border border-line bg-surface px-2 py-3 text-center">
            <Icon name={icon} className="text-lg text-secondary" />
            <span className="text-[10px] text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
