/** Earthy data-viz palette — used by every Recharts chart so they inherit the theme. */
export const CHART = {
  clay: "#c2552f",
  ochre: "#d99a2b",
  sage: "#6f8a5f",
  teal: "#4f7785",
  plum: "#8a5a6e",
  olive: "#9a8b4f",
  ink: "#211c18",
  inkMuted: "#6f655b",
  inkSubtle: "#9c9085",
  line: "#e7ded1",
  lineStrong: "#d8ccba",
  surface: "#fffdf9",
} as const;

/** Ordered series colors for multi-series charts. */
export const SERIES = [
  CHART.clay,
  CHART.teal,
  CHART.sage,
  CHART.ochre,
  CHART.plum,
  CHART.olive,
];

export const axisProps = {
  stroke: CHART.inkSubtle,
  tick: { fill: CHART.inkMuted, fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

export const gridProps = {
  stroke: CHART.line,
  strokeDasharray: "2 6",
  vertical: false,
} as const;
