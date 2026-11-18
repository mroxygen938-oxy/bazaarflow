/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, initials } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";
import { useCart, useTheme, useWishlist } from "@/store/providers";
import { logoutAction } from "@/app/actions/auth";
import { Icon } from "@/components/ui/icon";
import { Logo } from "./logo";

type NavCategory = { slug: string; name: string; icon: string };

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/bundles", label: "Smart Bundles" },
  { href: "/compare", label: "Compare" },
  { href: "/groups", label: "Group Buy" },
];

function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

export function Header({
  user,
  categories,
}: {
  user: SessionUser | null;
  categories: NavCategory[];
}) {
  const pathname = usePathname();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : user?.role === "SELLER" ? "/seller" : "/account";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-line">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex">
              {links.slice(0, 2).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === l.href ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="relative">
                <button
                  onClick={() => setCatOpen((v) => !v)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  Categories
                  <Icon name="expand_more" className={cn("text-base transition-transform", catOpen && "rotate-180")} />
                </button>
                {catOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCatOpen(false)} />
                    <div className="absolute left-0 z-50 mt-2 w-[520px] rounded-2xl border border-line bg-elevated p-3 shadow-2xl">
                      <div className="grid grid-cols-2 gap-1">
                        {categories.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/explore?category=${c.slug}`}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-high hover:text-ink"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-high text-primary-soft">
                              <Icon name={c.icon} className="text-lg" />
                            </span>
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              {links.slice(2).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === l.href ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <form action="/explore" className="hidden max-w-xs flex-1 md:block">
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted" />
              <input
                name="q"
                placeholder="Search premium products…"
                className="input h-10 pl-10"
                aria-label="Search"
              />
            </div>
          </form>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-high hover:text-ink sm:flex"
            >
              <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} className="text-xl" />
            </button>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-high hover:text-ink"
            >
              <Icon name="favorite" className="text-xl" />
              <CountBadge count={wishCount} />
            </Link>
            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-high hover:text-ink"
            >
              <Image src="/images/cart1.png" alt="Cart" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
              <CountBadge count={count} />
            </Link>

            {user ? (
              <div className="relative ml-1 hidden sm:block">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-high"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                    {initials(user.name)}
                  </span>
                  <span className="max-w-[90px] truncate text-sm font-medium text-ink">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-2xl border border-line bg-elevated p-1.5 shadow-2xl">
                      <Link
                        href={dashboardHref}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-high hover:text-ink"
                      >
                        <Icon name="dashboard" className="text-lg" />
                        Dashboard
                      </Link>
                      <form action={logoutAction}>
                        <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors hover:bg-high hover:text-ink">
                          <Icon name="logout" className="text-lg" />
                          Logout
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="ml-1 hidden items-center gap-1.5 sm:flex">
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link href="/register" className="inline-flex cursor-pointer select-none items-center justify-center rounded-lg border-2 border-black bg-[#FFE600] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000] transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#FFF033] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:bg-[#FFD000] active:shadow-[0px_0px_0px_0px_#000]">
                  Join
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-high hover:text-ink lg:hidden"
            >
              <Icon name={mobileOpen ? "close" : "menu"} className="text-xl" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="glass border-b border-line lg:hidden">
          <div className="container-page space-y-3 py-4">
            <form action="/explore">
              <div className="relative">
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted" />
                <input name="q" placeholder="Search products…" className="input h-11 pl-10" />
              </div>
            </form>
            <div className="grid grid-cols-2 gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-xl border border-line px-3 py-2.5 text-sm font-medium",
                    pathname === l.href ? "bg-high text-ink" : "text-muted",
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/explore?category=${c.slug}`}
                  className="flex items-center gap-1.5 rounded-full bg-high px-3 py-1.5 text-xs text-muted"
                >
                  <Icon name={c.icon} className="text-sm" />
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={toggleTheme}
                className="btn btn-secondary btn-sm"
              >
                <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} className="text-base" />
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              {user ? (
                <form action={logoutAction}>
                  <button className="btn btn-outline btn-sm">
                    <Icon name="logout" className="text-base" />
                    Sign out
                  </button>
                </form>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className="btn btn-secondary btn-sm">Sign in</Link>
                  <Link href="/register" className="inline-flex cursor-pointer select-none items-center justify-center rounded-lg border-2 border-black bg-[#FFE600] px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000] transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#FFF033] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:bg-[#FFD000] active:shadow-[0px_0px_0px_0px_#000]">Join</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
