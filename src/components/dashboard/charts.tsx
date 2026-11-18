import { cn } from "@/lib/utils";

export type Point = { label: string; value: number };

export function BarChart({
  data,
  height = 140,
  tone = "gradient",
  valuePrefix = "৳",
}: {
  data: Point[];
  height?: number;
  tone?: "gradient" | "secondary" | "tertiary";
  valuePrefix?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const tones: Record<string, string> = {
    gradient: "bg-gradient-to-t from-primary/40 to-primary",
    secondary: "bg-gradient-to-t from-secondary/30 to-secondary",
    tertiary: "bg-gradient-to-t from-tertiary/30 to-tertiary",
  };
  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="group relative flex flex-1 flex-col items-center justify-end">
            <div
              className={cn("w-full rounded-t-md transition-all duration-300 group-hover:brightness-125", tones[tone])}
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute -top-8 z-10 hidden whitespace-nowrap rounded-md bg-elevated px-2 py-1 text-[10px] font-semibold text-ink shadow-lg group-hover:block">
              {valuePrefix} {d.value.toLocaleString("en-US")}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-[9px] text-muted">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ShareList({
  data,
  tone = "primary",
}: {
  data: Point[];
  tone?: "primary" | "secondary" | "tertiary";
}) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const tones: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    tertiary: "bg-tertiary",
  };
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted">{d.label}</span>
            <span className="font-semibold text-ink">{Math.round((d.value / total) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-high">
            <div className={cn("h-full rounded-full", tones[tone])} style={{ width: `${(d.value / total) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
