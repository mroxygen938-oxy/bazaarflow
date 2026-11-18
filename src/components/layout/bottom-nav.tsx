"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/providers";
import { Icon } from "@/components/ui/icon";

const items = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/explore", label: "Explore", icon: "explore" },
  { href: "/bundles", label: "Bundles", icon: "hub" },
  { href: "/cart", label: "Bag", icon: "shopping_bag" },
  { href: "/account", label: "Account", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="glass border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
          {items.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary-soft" : "text-muted",
                )}
              >
                {item.href === "/cart" ? (
                  <Image src="/images/cart1.png" alt="Bag" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
                ) : (
                  <Icon name={item.icon} filled={active} className="text-[22px]" />
                )}
                {item.label}
                {item.href === "/cart" && count > 0 && (
                  <span className="absolute right-2 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
