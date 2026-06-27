import { CHART } from "@/lib/design/chart";
import { affiliateInventory } from "./site";

// Revenue is reported clicks-first; dollar figures are MODELED (clicks × category EPC)
// and clearly labeled estimates — per the attribution-risk decision in the research.

export interface ClusterRevenue {
  clusterId: string;
  label: string;
  clicks: number;
  modeledRevenue: number;
  topProduct: string;
}

export const revenueByCluster: ClusterRevenue[] = [
  { clusterId: "c-equip", label: "Equipment questions", clicks: 214, modeledRevenue: 642, topProduct: "Lodge 6qt Enameled Dutch Oven" },
  { clusterId: "c-source", label: "Ingredient sourcing", clicks: 71, modeledRevenue: 214, topProduct: "OXO Good Grips Food Scale" },
  { clusterId: "c-proof", label: "Proofing & doneness cues", clicks: 78, modeledRevenue: 168, topProduct: "ThermoWorks Thermapen ONE" },
  { clusterId: "c-tech", label: "Technique troubleshooting", clicks: 49, modeledRevenue: 156, topProduct: "Wüsthof Classic Chef's Knife" },
];

export const revenueTotals = {
  clicks: revenueByCluster.reduce((s, r) => s + r.clicks, 0),
  modeledRevenue: revenueByCluster.reduce((s, r) => s + r.modeledRevenue, 0),
};

// Top products for the donut, colored from the earth palette.
const PIE_COLORS = [CHART.clay, CHART.teal, CHART.ochre, CHART.sage, CHART.plum, CHART.olive];
export const revenueByProduct = affiliateInventory
  .filter((a) => a.modeledRevenue > 0)
  .sort((a, b) => b.modeledRevenue - a.modeledRevenue)
  .map((a, i) => ({ name: a.product, value: Math.round(a.modeledRevenue), color: PIE_COLORS[i % PIE_COLORS.length] }));

export interface MissedLink {
  id: string;
  question: string;
  postId: string;
  suggestedProduct: string;
  reason: string;
}

// "Questions where we *could* have linked but didn't" — manual approval, anti-spam.
export const couldHaveLinked: MissedLink[] = [
  {
    id: "m1",
    question: "What baking steel gives the crispiest pizza base?",
    postId: "p-focaccia",
    suggestedProduct: "Baking Steel Original",
    reason: "Only mentioned in 2 posts — review to enable surfacing.",
  },
  {
    id: "m2",
    question: "Which blender do you use for blended soups?",
    postId: "p-tuscan",
    suggestedProduct: "Vitamix 5200 Blender",
    reason: "Mentioned in 1 post — needs 2+ to be eligible (anti-spam).",
  },
  {
    id: "m3",
    question: "Best sturdy bench scraper for shaping dough?",
    postId: "p-bread",
    suggestedProduct: "OXO Stainless Bench Scraper",
    reason: "One-chip-per-answer cap was already reached on that reply.",
  },
];
