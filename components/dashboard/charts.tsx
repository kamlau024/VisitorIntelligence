"use client";

import * as React from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, PieChart, Pie,
} from "recharts";
import { CHART, axisProps, gridProps } from "@/lib/design/chart";
import { money } from "@/lib/utils";

/** String flag instead of a function, so these client charts can be used from server components. */
export type ValueFormat = "number" | "currency";
function fmtValue(v: number, f?: ValueFormat) {
  return f === "currency" ? money(v) : v.toLocaleString();
}

function ThemedTooltip({ active, payload, label, valueFormat }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs shadow-lg">
      {label && <div className="mb-1 font-medium text-ink">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-ink-muted">
          <span className="size-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold tnum text-ink">
            {fmtValue(p.value, valueFormat)}
          </span>
        </div>
      ))}
    </div>
  );
}

function shortDate(d: string) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AreaTrend({
  data, dataKey, color = CHART.clay, height = 240, valueFormat,
}: {
  data: any[];
  dataKey: string;
  color?: string;
  height?: number;
  valueFormat?: ValueFormat;
}) {
  const id = React.useId().replace(/:/g, "");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...gridProps} />
        <XAxis dataKey="date" {...axisProps} tickFormatter={shortDate} minTickGap={28} />
        <YAxis {...axisProps} width={44} />
        <Tooltip content={(p) => <ThemedTooltip {...p} valueFormat={valueFormat} />} cursor={{ stroke: CHART.lineStrong, strokeWidth: 1 }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5}
          fill={`url(#${id})`} dot={false} activeDot={{ r: 4, fill: color, stroke: CHART.surface, strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function HBarChart({
  data, height = 280, color = CHART.teal,
}: {
  data: { name: string; value: number }[];
  height?: number;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={9}>
        <CartesianGrid {...gridProps} horizontal={false} vertical />
        <XAxis type="number" {...axisProps} />
        <YAxis type="category" dataKey="name" {...axisProps} width={150}
          tick={{ fill: CHART.ink, fontSize: 12 }} />
        <Tooltip content={(p) => <ThemedTooltip {...p} />} cursor={{ fill: "rgba(33,28,24,0.04)" }} />
        <Bar dataKey="value" fill={color} radius={[0, 5, 5, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenuePie({
  data, valueFormat,
}: {
  data: { name: string; value: number; color: string }[];
  valueFormat?: ValueFormat;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84}
          paddingAngle={2} stroke={CHART.surface} strokeWidth={2}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip content={(p) => <ThemedTooltip {...p} valueFormat={valueFormat} />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MiniArea({ data, dataKey, color = CHART.clay }: { data: any[]; dataKey: string; color?: string }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
