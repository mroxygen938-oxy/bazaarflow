import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary-soft">
        <Icon name="explore_off" className="text-4xl" />
      </div>
      <h1 className="mt-6 font-display text-5xl font-bold text-ink">404</h1>
      <p className="mt-2 max-w-sm text-muted">
        This aisle doesn&apos;t exist. The page may have moved or the product is no longer listed.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className="btn btn-primary">
          <Icon name="home" className="text-base" />
          Back home
        </Link>
        <Link href="/explore" className="btn-neo">
          Explore marketplace
        </Link>
      </div>
    </div>
  );
}
