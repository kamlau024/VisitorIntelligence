import type { Confidence } from "./types";
import { affiliateInventory } from "./site";

export interface AffiliateChip {
  product: string;
  retailer: string;
  price: number;
  authorPickSince: number | null;
}

export interface WidgetAnswer {
  /** keyword triggers used to match free-text questions */
  match: string[];
  /** the suggested-question label (also used as the canonical question) */
  question: string;
  /** author-voiced answer, 1-2 short paragraphs */
  answer: string[];
  confidence: Confidence;
  citations: string[];
  affiliate?: AffiliateChip;
}

const chip = (id: string): AffiliateChip => {
  const p = affiliateInventory.find((a) => a.id === id)!;
  return {
    product: p.product,
    retailer: p.retailer,
    price: p.price,
    authorPickSince: p.authorPickSince,
  };
};

export const suggestedQuestions = [
  "I don't have a Dutch oven — what can I use?",
  "No buttermilk. What's the best swap?",
  "Can I make this dairy-free?",
  "How do I adjust the bread for high altitude?",
];

export const cannedAnswers: WidgetAnswer[] = [
  {
    match: ["dutch oven", "pot", "without a dutch", "no dutch"],
    question: "I don't have a Dutch oven — what can I use?",
    answer: [
      "You don't strictly need one! The Dutch oven just traps steam so the crust sets slowly. You can get most of the way there with any heavy oven-safe pot and a tight lid, or a deep cast-iron pan covered with a metal bowl for the first 20 minutes.",
      "That said, if you bake bread even a few times a year, an enameled Dutch oven is the one tool I'd actually buy — it's what I've used for every loaf on this site.",
    ],
    confidence: "high",
    citations: ["No-Knead Dutch Oven Bread", "Weeknight Sourdough Focaccia"],
    affiliate: chip("a-dutch"),
  },
  {
    match: ["buttermilk", "butter milk"],
    question: "No buttermilk. What's the best swap?",
    answer: [
      "Easy fix: stir 1 tablespoon of lemon juice or white vinegar into 1 cup of regular milk and let it sit for 5 minutes until it looks slightly curdled. That's the swap I use myself when I run out — it gives you the same tang and lift in the pancakes.",
      "Plain yogurt thinned with a splash of milk works too, but the lemon-milk trick is the one I reach for first.",
    ],
    confidence: "high",
    citations: ["The Best Buttermilk Pancakes"],
  },
  {
    match: ["dairy", "dairy-free", "dairy free", "lactose", "without cream"],
    question: "Can I make this dairy-free?",
    answer: [
      "Yes — for the creamy Tuscan chicken, unsweetened oat cream or a cashew cream both hold up well and won't split if you keep the heat at a gentle simmer. I'd avoid coconut milk here unless you like a hint of coconut in a savory sauce.",
      "I'm honest that I haven't fully retested every variation, so taste and adjust the salt at the end.",
    ],
    confidence: "medium",
    citations: ["One-Pot Creamy Tuscan Chicken"],
  },
  {
    match: ["altitude", "elevation", "denver", "high altitude", "6000", "ft"],
    question: "How do I adjust the bread for high altitude?",
    answer: [
      "I want to be straight with you — I bake at sea level, so I don't have a tested high-altitude version of this loaf yet. The usual starting points are slightly less yeast and a touch more water, but I'd rather not guess at exact numbers for your elevation.",
    ],
    confidence: "low",
    citations: ["No-Knead Dutch Oven Bread"],
  },
  {
    match: ["stand mixer", "mixer", "kitchenaid"],
    question: "What stand mixer do you use?",
    answer: [
      "For the focaccia and most doughs I use a KitchenAid Pro 5 Plus — it's the workhorse I've had since 2020 and it handles wet, sticky dough without walking across the counter.",
      "Honestly though, every recipe here can be done by hand if you'd rather not buy one.",
    ],
    confidence: "high",
    citations: ["Weeknight Sourdough Focaccia"],
    affiliate: chip("a-mixer"),
  },
  {
    match: ["proof", "proofed", "risen", "rise", "poke test", "done"],
    question: "How do I know when the dough is proofed enough?",
    answer: [
      "The poke test is your friend: flour a finger and press gently into the dough. If it springs back slowly and leaves a small dent, it's ready. Springs back fast = needs more time; doesn't spring back at all = slightly over-proofed but still bakeable.",
    ],
    confidence: "low",
    citations: ["No-Knead Dutch Oven Bread", "Weeknight Sourdough Focaccia"],
    affiliate: chip("a-thermo"),
  },
];

/** Fallback when nothing matches — low confidence, invites a bounty. */
export const fallbackAnswer: WidgetAnswer = {
  match: [],
  question: "",
  answer: [
    "That's a great question and I don't want to give you a confident answer I haven't tested. Here's my best general take — but you may want to ask Maya directly to be sure.",
  ],
  confidence: "low",
  citations: [],
};

export function matchAnswer(input: string): WidgetAnswer {
  const q = input.toLowerCase();
  for (const a of cannedAnswers) {
    if (a.match.some((m) => q.includes(m))) return a;
  }
  return fallbackAnswer;
}
