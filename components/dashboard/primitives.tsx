import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, pct } from "@/lib/utils";

export function PageHeader({
  title, kicker, description, actions,
}: {
  title: string;
  kicker?: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && <p className="kicker mb-1.5">{kicker}</p>}
        <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-6xl px-4 py-6 lg:px-7 lg:py-8", className)}>
      {children}
    </div>
  );
}

export function TrendPill({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const good = inverse ? value < 0 : value >= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold tnum",
        good ? "bg-positive-soft text-positive" : "bg-conf-low-soft text-conf-low"
      )}
    >
      <Icon className="size-3" />
      {pct(value)}
    </span>
  );
}

export function StatCard({
  label, value, trend, trendInverse, footnote, accent,
}: {
  label: string;
  value: string;
  trend?: number;
  trendInverse?: boolean;
  footnote?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-surface p-5 edge",
      accent ? "border-accent/30" : "border-line"
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">{label}</span>
        {trend !== undefined && <TrendPill value={trend} inverse={trendInverse} />}
      </div>
      <div className="mt-2 font-display text-3xl font-medium text-ink tnum">{value}</div>
      {footnote && <div className="mt-1 text-xs text-ink-subtle">{footnote}</div>}
    </div>
  );
}

export function Panel({
  title, description, action, children, className, bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-line bg-surface edge", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="font-display text-lg font-medium tracking-tight text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function EstimateTag({ children = "Estimated" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-conf-med-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-conf-med">
      {children}
    </span>
  );
}
