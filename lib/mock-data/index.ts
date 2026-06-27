export * from "./types";
export * from "./site";
export * from "./intent";
export * from "./gaps";
export * from "./bounties";
export * from "./widget";
export * from "./revenue";

import { site, posts, affiliateInventory } from "./site";
import { clusters, recentQuestions, dailySeries, overview } from "./intent";
import { contentGaps } from "./gaps";
import { bounties } from "./bounties";

/** Convenience handle for the whole mock dataset. */
export const db = {
  site,
  posts,
  affiliate: affiliateInventory,
  clusters,
  recentQuestions,
  dailySeries,
  overview,
  contentGaps,
  bounties,
};

export const PRICING = [
  {
    tier: "Free",
    price: 0,
    cadence: "forever",
    tagline: "For hobby & side-hustle sites under 25k readers/mo.",
    cta: "Start free",
    highlight: false,
    features: [
      "100 questions / month",
      "Author-voiced Q&A widget",
      "Basic intent capture",
      '"Powered by Visitor Intelligence" badge',
    ],
  },
  {
    tier: "Pro",
    price: 29,
    cadence: "/mo",
    tagline: "For mid-tier creators monetizing 25k–500k readers/mo.",
    cta: "Start 14-day trial",
    highlight: true,
    features: [
      "5,000 questions / month",
      "Author-Voiced Affiliate Surfacing",
      "Full intent-capture analytics",
      "Content gap → draft pipeline",
      "Includes 3 Full Drafts / month",
      "Remove badge",
    ],
  },
  {
    tier: "Studio",
    price: 79,
    cadence: "/mo",
    tagline: "For pro publishers & small teams at 500k+ readers/mo.",
    cta: "Start 14-day trial",
    highlight: false,
    features: [
      "Unlimited questions",
      "Multi-site & team seats",
      "White-label widget",
      "Confidence + reader bounties",
      "Includes 20 Full Drafts / month",
      "API access",
    ],
  },
] as const;
