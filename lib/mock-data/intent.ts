import type {
  IntentCluster,
  VisitorQuestion,
  DayPoint,
  Overview,
} from "./types";

export const clusters: IntentCluster[] = [
  {
    id: "c-sub",
    label: "Ingredient substitutions",
    category: "substitution",
    volume: 1284,
    trendWoW: 12,
    buyingIntent: false,
    avgConfidence: "high",
    sampleQuestions: [
      "No buttermilk — what can I use instead?",
      "Can I swap the heavy cream for half-and-half?",
      "Out of bread flour, is all-purpose okay?",
    ],
    relatedPosts: ["p-pancakes", "p-tuscan", "p-bread"],
  },
  {
    id: "c-diet",
    label: "Dietary & allergy reformulation",
    category: "dietary",
    volume: 947,
    trendWoW: 28,
    buyingIntent: false,
    avgConfidence: "medium",
    sampleQuestions: [
      "Can I make this gluten-free?",
      "How do I make the Tuscan chicken dairy-free?",
      "Is there an egg substitute for the pancakes?",
    ],
    relatedPosts: ["p-banana", "p-tuscan", "p-pancakes"],
  },
  {
    id: "c-equip",
    label: "Equipment questions",
    category: "equipment",
    volume: 731,
    trendWoW: 9,
    buyingIntent: true,
    avgConfidence: "high",
    sampleQuestions: [
      "Do I really need a Dutch oven for the bread?",
      "What stand mixer do you use?",
      "Can I use a regular sheet pan?",
    ],
    relatedPosts: ["p-bread", "p-focaccia", "p-salmon"],
  },
  {
    id: "c-tech",
    label: "Technique troubleshooting",
    category: "technique",
    volume: 689,
    trendWoW: 4,
    buyingIntent: false,
    avgConfidence: "medium",
    sampleQuestions: [
      "My dough didn't rise — what went wrong?",
      "Why is my focaccia dense?",
      "How do I know when the bread is done?",
    ],
    relatedPosts: ["p-bread", "p-focaccia"],
  },
  {
    id: "c-time",
    label: "Make-ahead & timing",
    category: "timing",
    volume: 542,
    trendWoW: 18,
    buyingIntent: false,
    avgConfidence: "high",
    sampleQuestions: [
      "Can I make this the night before?",
      "How far ahead can I prep the salmon?",
      "Can the dough rest overnight?",
    ],
    relatedPosts: ["p-salmon", "p-bread", "p-korean-beef"],
  },
  {
    id: "c-store",
    label: "Storage & freezing",
    category: "storage",
    volume: 498,
    trendWoW: 41,
    buyingIntent: false,
    avgConfidence: "low",
    sampleQuestions: [
      "Can I freeze the sourdough after baking?",
      "How long does Korean beef keep in the fridge?",
      "Best way to reheat focaccia?",
    ],
    relatedPosts: ["p-focaccia", "p-korean-beef", "p-bread"],
  },
  {
    id: "c-scale",
    label: "Scaling & servings",
    category: "scaling",
    volume: 356,
    trendWoW: 6,
    buyingIntent: false,
    avgConfidence: "high",
    sampleQuestions: [
      "How do I double this recipe?",
      "Can I halve the pancake batter?",
      "Will this fit a 9x13 pan?",
    ],
    relatedPosts: ["p-pancakes", "p-banana"],
  },
  {
    id: "c-source",
    label: "Ingredient sourcing",
    category: "sourcing",
    volume: 287,
    trendWoW: 14,
    buyingIntent: true,
    avgConfidence: "medium",
    sampleQuestions: [
      "Where do you buy your sourdough starter?",
      "What brand of gluten-free flour do you recommend?",
      "Which soy sauce do you use?",
    ],
    relatedPosts: ["p-focaccia", "p-banana", "p-korean-beef"],
  },
  {
    id: "c-nutri",
    label: "Nutrition & macros",
    category: "nutrition",
    volume: 241,
    trendWoW: -3,
    buyingIntent: false,
    avgConfidence: "low",
    sampleQuestions: [
      "How many calories per serving?",
      "Is this recipe keto-friendly?",
      "What's the carb count for the bread?",
    ],
    relatedPosts: ["p-tuscan", "p-bread"],
  },
  {
    id: "c-altitude",
    label: "High-altitude adjustments",
    category: "technique",
    volume: 198,
    trendWoW: 220,
    buyingIntent: false,
    avgConfidence: "low",
    sampleQuestions: [
      "How do I adjust the bread for high altitude?",
      "At 6,000 ft my banana bread sinks — help?",
      "Do I change the yeast amount in Denver?",
    ],
    relatedPosts: ["p-bread", "p-banana"],
  },
  {
    id: "c-proof",
    label: "Proofing & doneness cues",
    category: "technique",
    volume: 176,
    trendWoW: 33,
    buyingIntent: true,
    avgConfidence: "low",
    sampleQuestions: [
      "How do I know when the dough is proofed enough?",
      "What temp should the bread reach inside?",
      "Is the poke test reliable?",
    ],
    relatedPosts: ["p-bread", "p-focaccia"],
  },
  {
    id: "c-convert",
    label: "Metric conversions",
    category: "scaling",
    volume: 142,
    trendWoW: 2,
    buyingIntent: false,
    avgConfidence: "high",
    sampleQuestions: [
      "What's 2 cups of flour in grams?",
      "Can you give the recipe in metric?",
      "How many ml is one cup?",
    ],
    relatedPosts: ["p-bread", "p-banana"],
  },
];

export const clusterById = (id: string) => clusters.find((c) => c.id === id);

// Recent verbatim questions feed (newest first).
export const recentQuestions: VisitorQuestion[] = [
  { id: "q1", text: "Can I freeze the sourdough focaccia after baking?", postId: "p-focaccia", clusterId: "c-store", askedAt: "2026-06-23T08:41:00Z", confidence: "low", affiliateSurfaced: false, helpful: null },
  { id: "q2", text: "No buttermilk on hand — what's the best swap for the pancakes?", postId: "p-pancakes", clusterId: "c-sub", askedAt: "2026-06-23T08:33:00Z", confidence: "high", affiliateSurfaced: false, helpful: true },
  { id: "q3", text: "Do I really need a Dutch oven, or can I use a regular pot?", postId: "p-bread", clusterId: "c-equip", askedAt: "2026-06-23T08:20:00Z", confidence: "high", affiliateSurfaced: true, helpful: true },
  { id: "q4", text: "How do I adjust this bread recipe for 6,000 ft altitude?", postId: "p-bread", clusterId: "c-altitude", askedAt: "2026-06-23T08:02:00Z", confidence: "low", affiliateSurfaced: false, helpful: false },
  { id: "q5", text: "Can I make the Tuscan chicken dairy-free?", postId: "p-tuscan", clusterId: "c-diet", askedAt: "2026-06-23T07:55:00Z", confidence: "medium", affiliateSurfaced: false, helpful: true },
  { id: "q6", text: "What stand mixer do you use for the focaccia dough?", postId: "p-focaccia", clusterId: "c-equip", askedAt: "2026-06-23T07:48:00Z", confidence: "high", affiliateSurfaced: true, helpful: true },
  { id: "q7", text: "How do I know when the dough has proofed enough?", postId: "p-bread", clusterId: "c-proof", askedAt: "2026-06-23T07:30:00Z", confidence: "low", affiliateSurfaced: true, helpful: null },
  { id: "q8", text: "Can I prep the sheet-pan salmon the night before?", postId: "p-salmon", clusterId: "c-time", askedAt: "2026-06-23T07:12:00Z", confidence: "high", affiliateSurfaced: false, helpful: true },
  { id: "q9", text: "Which gluten-free flour brand works best here?", postId: "p-banana", clusterId: "c-source", askedAt: "2026-06-23T06:59:00Z", confidence: "medium", affiliateSurfaced: true, helpful: true },
  { id: "q10", text: "How long does the Korean beef keep in the fridge?", postId: "p-korean-beef", clusterId: "c-store", askedAt: "2026-06-23T06:40:00Z", confidence: "medium", affiliateSurfaced: false, helpful: null },
  { id: "q11", text: "Can I double the banana bread for two loaves?", postId: "p-banana", clusterId: "c-scale", askedAt: "2026-06-23T06:22:00Z", confidence: "high", affiliateSurfaced: false, helpful: true },
  { id: "q12", text: "What internal temp should the bread reach?", postId: "p-bread", clusterId: "c-proof", askedAt: "2026-06-23T06:05:00Z", confidence: "low", affiliateSurfaced: true, helpful: null },
];

// Deterministic ~30-day series so charts look real and stable across renders.
function buildSeries(): DayPoint[] {
  const days = 30;
  const out: DayPoint[] = [];
  const start = new Date("2026-05-25T00:00:00Z").getTime();
  for (let i = 0; i < days; i++) {
    const t = start + i * 86_400_000;
    const wave = Math.sin(i / 4.2) * 0.22 + Math.sin(i / 9) * 0.12;
    const weekend = [0, 6].includes(new Date(t).getUTCDay()) ? 1.18 : 1;
    const base = 165 + i * 1.6; // gentle growth
    const questions = Math.round(base * (1 + wave) * weekend);
    const engagedVisitors = Math.round(questions * (0.78 + (i % 5) * 0.012));
    const clicks = Math.round(questions * (0.21 + Math.sin(i / 3) * 0.03));
    out.push({
      date: new Date(t).toISOString().slice(0, 10),
      questions,
      clicks,
      engagedVisitors,
    });
  }
  return out;
}

export const dailySeries: DayPoint[] = buildSeries();

export const overview: Overview = {
  questionsThisWeek: 1_284,
  questionsTrendWoW: 12,
  engagedRate: 2.4,
  baselineRate: 0.2,
  clicksThisWeek: 412,
  clicksTrendWoW: 9,
  modeledRevenue: 1_180,
  revenueTrendWoW: 14,
  unansweredThisWeek: 86,
  lowConfidenceShare: 11,
};
