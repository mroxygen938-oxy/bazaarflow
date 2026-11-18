import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Logo } from "./logo";

const groups = [
  {
    title: "Marketplace",
    links: [
      { label: "Explore products", href: "/explore" },
      { label: "Categories", href: "/explore" },
      { label: "Smart Bundles", href: "/bundles" },
      { label: "Group Shopping", href: "/groups" },
      { label: "Compare", href: "/compare" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "Help center", href: "/account" },
      { label: "Track orders", href: "/account" },
      { label: "Returns & refunds", href: "/account" },
      { label: "Escrow protection", href: "/design-system" },
    ],
  },
  {
    title: "Sell With Us",
    links: [
      { label: "Seller registration", href: "/register?role=SELLER" },
      { label: "Seller dashboard", href: "/seller" },
      { label: "Policies", href: "/design-system" },
      { label: "Admin console", href: "/admin" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-panel pb-20 lg:pb-0">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted">
              Shop by Your Needs, Not Just by Products. Premium multi-vendor
              commerce with escrow protection across Bangladesh.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Icon name="location_on" className="text-base text-secondary" />
              Dhaka, Bangladesh — ৳ BDT
            </div>
            <div className="mt-5 flex items-center gap-2">
              {["hub", "forum", "verified", "public"].map((icon) => (
                <span
                  key={icon}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-high text-muted transition-colors hover:text-primary-soft"
                >
                  <Icon name={icon} className="text-base" />
                </span>
              ))}
            </div>

            <form className="mt-6 max-w-sm" action="/explore">
              <label className="label">Newsletter</label>
              <div className="flex gap-2">
                <input className="input" placeholder="you@email.com" type="email" />
                <button className="inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg border-2 border-black bg-black px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0_0_#FFE600] transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#141414] hover:shadow-[5px_5px_0_0_#FFE600] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#FFE600]">
                  <Icon name="send" className="text-base" />
                  Subscribe
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((g) => (
              <div key={g.title}>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-ink">
                  {g.title}
                </h4>
                <ul className="space-y-2.5">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted transition-colors hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} BAZAARFLOW. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            {["Cash on Delivery", "bKash", "Nagad", "Visa", "Mastercard"].map((p) => (
              <span
                key={p}
                className="rounded-md border border-line bg-high px-2 py-1 text-[10px] font-medium text-muted"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
