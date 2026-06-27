import type { Site, RecipePost, AffiliateProduct } from "./types";

export const site: Site = {
  id: "twk",
  name: "The Weeknight Kitchen",
  domain: "theweeknightkitchen.com",
  tagline: "Fast, real dinners for busy families.",
  cms: "wordpress",
  plan: "pro",
  monthlySessions: 128_400,
  author: {
    name: "Maya Brennan",
    handle: "@maya",
    avatarInitials: "MB",
    bio: "Recipe developer. I help busy parents get a real dinner on the table on a Tuesday.",
  },
  installedOn: "2026-04-02",
  pagesIndexed: 142,
  recipesDetected: 38,
  affiliateLinksDetected: 96,
  lastCrawl: "2026-06-22T06:12:00Z",
};

export const posts: RecipePost[] = [
  { id: "p-tuscan", title: "One-Pot Creamy Tuscan Chicken", slug: "creamy-tuscan-chicken", category: "Dinner", publishedYear: 2022, monthlyViews: 24_800, questionsCaptured: 412 },
  { id: "p-bread", title: "No-Knead Dutch Oven Bread", slug: "no-knead-dutch-oven-bread", category: "Bread", publishedYear: 2021, monthlyViews: 31_200, questionsCaptured: 638 },
  { id: "p-focaccia", title: "Weeknight Sourdough Focaccia", slug: "sourdough-focaccia", category: "Bread", publishedYear: 2023, monthlyViews: 18_400, questionsCaptured: 503 },
  { id: "p-salmon", title: "30-Minute Sheet-Pan Salmon", slug: "sheet-pan-salmon", category: "Dinner", publishedYear: 2023, monthlyViews: 15_900, questionsCaptured: 274 },
  { id: "p-pancakes", title: "The Best Buttermilk Pancakes", slug: "buttermilk-pancakes", category: "Breakfast", publishedYear: 2020, monthlyViews: 22_100, questionsCaptured: 389 },
  { id: "p-korean-beef", title: "Slow Cooker Korean Beef", slug: "slow-cooker-korean-beef", category: "Dinner", publishedYear: 2022, monthlyViews: 12_600, questionsCaptured: 201 },
  { id: "p-banana", title: "Gluten-Free Banana Bread", slug: "gluten-free-banana-bread", category: "Baking", publishedYear: 2024, monthlyViews: 9_800, questionsCaptured: 233 },
];

export const postById = (id: string) => posts.find((p) => p.id === id);

export const affiliateInventory: AffiliateProduct[] = [
  { id: "a-dutch", product: "Lodge 6qt Enameled Dutch Oven", retailer: "Amazon", network: "amazon", price: 79.9, mentions: 11, authorPickSince: 2019, eligible: true, included: true, clicksFromChat: 184, modeledRevenue: 412.6 },
  { id: "a-mixer", product: "KitchenAid Pro 5 Plus Stand Mixer", retailer: "Amazon", network: "amazon", price: 449.0, mentions: 8, authorPickSince: 2020, eligible: true, included: true, clicksFromChat: 96, modeledRevenue: 388.2 },
  { id: "a-thermo", product: "ThermoWorks Thermapen ONE", retailer: "ThermoWorks", network: "lasso", price: 109.0, mentions: 6, authorPickSince: 2021, eligible: true, included: true, clicksFromChat: 71, modeledRevenue: 142.0 },
  { id: "a-sheet", product: "Nordic Ware Half Sheet Pan", retailer: "Amazon", network: "amazon", price: 18.5, mentions: 9, authorPickSince: 2019, eligible: true, included: true, clicksFromChat: 64, modeledRevenue: 51.2 },
  { id: "a-knife", product: "Wüsthof Classic 8\" Chef's Knife", retailer: "Amazon", network: "amazon", price: 169.0, mentions: 5, authorPickSince: 2018, eligible: true, included: true, clicksFromChat: 52, modeledRevenue: 198.4 },
  { id: "a-scale", product: "OXO Good Grips Food Scale", retailer: "Amazon", network: "amazon", price: 54.0, mentions: 4, authorPickSince: 2022, eligible: true, included: true, clicksFromChat: 38, modeledRevenue: 41.0 },
  { id: "a-scraper", product: "OXO Stainless Bench Scraper", retailer: "Amazon", network: "amazon", price: 14.0, mentions: 3, authorPickSince: 2021, eligible: true, included: true, clicksFromChat: 22, modeledRevenue: 9.4 },
  { id: "a-steel", product: "Baking Steel Original", retailer: "Baking Steel", network: "shareasale", price: 119.0, mentions: 2, authorPickSince: 2023, eligible: true, included: false, clicksFromChat: 0, modeledRevenue: 0 },
  { id: "a-blender", product: "Vitamix 5200 Blender", retailer: "Amazon", network: "amazon", price: 449.0, mentions: 1, authorPickSince: null, eligible: false, included: false, clicksFromChat: 0, modeledRevenue: 0 },
];
