"use client";

import { Icon } from "@/components/ui/icon";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-danger/15 text-danger">
        <Icon name="error" className="text-4xl" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <button onClick={reset} className="btn btn-primary mt-6">
        <Icon name="refresh" className="text-base" />
        Try again
      </button>
    </div>
  );
}
