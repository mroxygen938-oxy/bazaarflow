import type { ReactNode } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/layout/logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line shadow-2xl lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-panel p-10 lg:flex">
          <div className="aurora -left-20 -top-20 h-72 w-72 bg-primary/25" />
          <div className="aurora -bottom-24 -right-16 h-72 w-72 bg-secondary/20" />
          <div className="relative z-10">
            <Logo />
            <h2 className="mt-10 font-display text-3xl font-bold leading-tight text-ink">
              Shop by your needs,
              <br />
              not just by <span className="gradient-text">products.</span>
            </h2>
            <p className="mt-3 max-w-sm text-sm text-muted">
              Join Bangladesh&apos;s premium multi-vendor marketplace with escrow
              protection, smart bundles and personalized discovery.
            </p>
          </div>
          <div className="relative z-10">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-line">
              <Image
                src="/images/products/img-03.jpg"
                alt="Premium setup"
                fill
                sizes="400px"
                className="object-cover"
              />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ["৳ 45M+", "Traded"],
                ["1,200+", "Sellers"],
                ["99.8%", "On-time"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div className="font-display text-lg font-bold text-ink">{v}</div>
                  <div className="text-[10px] text-muted">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-canvas p-6 sm:p-10">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Logo />
          </div>
          <span className="chip bg-primary/15 text-primary-soft">
            <Icon name="verified_user" className="text-sm" />
            Secure access
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
