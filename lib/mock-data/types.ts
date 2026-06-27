// Domain types for Visitor Intelligence mock data.
// Vocabulary follows Canonical Vocabulary: visitor/reader, publisher, intent vs behavior.

export type Confidence = "high" | "medium" | "low";

export type CmsKind =
  | "wordpress"
  | "squarespace"
  | "ghost"
  | "webflow"
  | "shopify"
  | "manual";

export type Plan = "free" | "pro" | "studio";

export interface Author {
  name: string;
  handle: string;
  avatarInitials: string;
  bio: string;
}

export interface Site {
  id: string;
  name: string;
  domain: string;
  tagline: string;
  cms: CmsKind;
  plan: Plan;
  monthlySessions: number;
  author: Author;
  installedOn: string;
  pagesIndexed: number;
  recipesDetected: number;
  affiliateLinksDetected: number;
  lastCrawl: string;
}

export interface RecipePost {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedYear: number;
  monthlyViews: number;
  questionsCaptured: number;
}

export type AffiliateNetwork = "amazon" | "lasso" | "shareasale" | "impact";

export interface AffiliateProduct {
  id: string;
  product: string;
  retailer: string;
  network: AffiliateNetwork;
  price: number;
  /** how many of the author's own posts mention/recommend it */
  mentions: number;
  authorPickSince: number | null;
  /** eligible to surface only if mentions >= 2 or author-tagged */
  eligible: boolean;
  included: boolean;
  clicksFromChat: number;
  modeledRevenue: number;
}

export type IntentCategory =
  | "substitution"
  | "dietary"
  | "equipment"
  | "technique"
  | "timing"
  | "storage"
  | "scaling"
  | "sourcing"
  | "nutrition";

export interface IntentCluster {
  id: string;
  label: string;
  category: IntentCategory;
  volume: number;
  trendWoW: number; // percent
  /** does this cluster carry affiliate-buying intent */
  buyingIntent: boolean;
  avgConfidence: Confidence;
  sampleQuestions: string[];
  relatedPosts: string[]; // post ids
}

export interface VisitorQuestion {
  id: string;
  text: string;
  postId: string;
  clusterId: string;
  askedAt: string; // ISO
  confidence: Confidence;
  affiliateSurfaced: boolean;
  helpful: boolean | null;
}

export interface DayPoint {
  date: string; // ISO date
  questions: number;
  clicks: number;
  engagedVisitors: number;
}

export interface ContentGap {
  id: string;
  label: string;
  volume: number;
  trendWoW: number;
  status: "new" | "queued" | "drafted";
  verbatim: string[];
  nearMissPosts: { postId: string; coverage: number }[];
  outline: { heading: string; note: string }[];
  priority: number;
}

export type BountyStatus = "pending" | "answered";

export interface Bounty {
  id: string;
  question: string;
  postId: string;
  price: number;
  visitorEmail: string;
  status: BountyStatus;
  askedAt: string;
  answeredAt?: string;
  fundedBy?: number; // readers who hit the resulting note
  answer?: string;
}

export interface Overview {
  questionsThisWeek: number;
  questionsTrendWoW: number;
  engagedRate: number; // % of visitors who engaged the widget
  baselineRate: number; // survey/comment baseline for comparison
  clicksThisWeek: number;
  clicksTrendWoW: number;
  modeledRevenue: number;
  revenueTrendWoW: number;
  unansweredThisWeek: number;
  lowConfidenceShare: number;
}
