import type { Bounty } from "./types";

// Confidence + Bounty wildcard. Low-confidence answers can become paid
// "ask the author" bounties that turn into permanent Reader-Funded Notes.
export const bounties: Bounty[] = [
  {
    id: "b1",
    question:
      "At 6,500 ft my no-knead loaf collapses in the oven. What exactly should I change — yeast, water, or bake temp?",
    postId: "p-bread",
    price: 5,
    visitorEmail: "k•••@gmail.com",
    status: "pending",
    askedAt: "2026-06-23T06:10:00Z",
  },
  {
    id: "b2",
    question:
      "Can I make the focaccia with a 100% whole-wheat flour and still get the open crumb?",
    postId: "p-focaccia",
    price: 3,
    visitorEmail: "danielle•••@me.com",
    status: "pending",
    askedAt: "2026-06-22T19:42:00Z",
  },
  {
    id: "b3",
    question:
      "My banana bread is always gummy in the middle even after the toothpick comes clean. What am I doing wrong?",
    postId: "p-banana",
    price: 3,
    visitorEmail: "r•••@outlook.com",
    status: "answered",
    askedAt: "2026-06-19T14:05:00Z",
    answeredAt: "2026-06-20T09:18:00Z",
    fundedBy: 14,
    answer:
      "Gummy-but-clean usually means it's actually under-baked — the toothpick hits a pocket of melted banana, not raw batter. Pull it 5–7°F higher (I go to 205°F internal) and let it cool fully in the pan for 20 minutes before slicing. The carryover finishes the center.",
  },
  {
    id: "b4",
    question:
      "Which gluten-free flour blend gives the least 'beany' aftertaste in the banana bread?",
    postId: "p-banana",
    price: 3,
    visitorEmail: "s•••@gmail.com",
    status: "answered",
    askedAt: "2026-06-17T11:20:00Z",
    answeredAt: "2026-06-18T08:00:00Z",
    fundedBy: 9,
    answer:
      "I reach for a rice-based 1:1 blend (King Arthur Measure for Measure) over chickpea or bean-flour blends, which carry that earthy note. If you only have a bean blend, a teaspoon of vanilla plus the brown butter in the recipe masks most of it.",
  },
];

export const pendingBounties = bounties.filter((b) => b.status === "pending");
export const answeredBounties = bounties.filter((b) => b.status === "answered");
export const bountyEarnings = bounties.reduce(
  (sum, b) => (b.status === "answered" ? sum + b.price : sum),
  0
);
