import type { ContentGap } from "./types";

// Gap-to-Draft Pipeline (Gap B). Clusters of unanswered/under-answered questions,
// each with a pre-drafted outline scaffold the publisher finishes against.
export const contentGaps: ContentGap[] = [
  {
    id: "g-freeze",
    label: "Freezing & reheating your sourdough",
    volume: 184,
    trendWoW: 220,
    status: "new",
    priority: 1,
    verbatim: [
      "Can I freeze the focaccia after baking?",
      "Best way to reheat frozen sourdough without it going gummy?",
      "Does freezing ruin the crust?",
      "How long does baked bread last in the freezer?",
      "Can I freeze the dough instead of the baked loaf?",
    ],
    nearMissPosts: [
      { postId: "p-focaccia", coverage: 0.4 },
      { postId: "p-bread", coverage: 0.25 },
    ],
    outline: [
      { heading: "Freezing baked vs. unbaked dough", note: "Address both — readers ask about each." },
      { heading: "How to wrap and store for best crust", note: "Cite the focaccia post's cooling step." },
      { heading: "Reheating method that revives the crust", note: "Oven temp + time; the #1 verbatim ask." },
      { heading: "How long it actually keeps", note: "Give a concrete window with a quality note." },
      { heading: "FAQ block (auto-built from the 5 questions)", note: "Embed verbatim reader questions as blockquotes." },
    ],
  },
  {
    id: "g-altitude",
    label: "High-altitude baking adjustments",
    volume: 198,
    trendWoW: 220,
    status: "new",
    priority: 2,
    verbatim: [
      "How do I adjust the bread for 6,000 ft?",
      "My banana bread sinks in Denver — help?",
      "Do I reduce the yeast at altitude?",
      "Less or more liquid up high?",
    ],
    nearMissPosts: [
      { postId: "p-bread", coverage: 0.15 },
      { postId: "p-banana", coverage: 0.1 },
    ],
    outline: [
      { heading: "Why altitude changes baking", note: "One short, plain-language paragraph." },
      { heading: "Adjustments table by elevation band", note: "3,000 / 5,000 / 7,000 ft." },
      { heading: "Recipe-specific notes", note: "Link bread + banana bread directly." },
      { heading: "FAQ block from reader questions", note: "" },
    ],
  },
  {
    id: "g-dairyfree",
    label: "Dairy-free swaps for creamy pasta sauces",
    volume: 132,
    trendWoW: 38,
    status: "queued",
    priority: 3,
    verbatim: [
      "How do I make the Tuscan chicken dairy-free?",
      "Best non-dairy cream that won't split?",
      "Can I use coconut milk without it tasting coconutty?",
    ],
    nearMissPosts: [{ postId: "p-tuscan", coverage: 0.3 }],
    outline: [
      { heading: "The 3 dairy-free creams ranked", note: "Cashew, oat, coconut — flavor + behavior." },
      { heading: "How to keep the sauce from splitting", note: "Technique the Tuscan post already hints at." },
      { heading: "Exact swaps for the Tuscan chicken", note: "" },
    ],
  },
  {
    id: "g-proof",
    label: "How to tell when bread is fully proofed",
    volume: 176,
    trendWoW: 33,
    status: "new",
    priority: 4,
    verbatim: [
      "How do I know when the dough is proofed enough?",
      "Is the poke test reliable?",
      "Over-proofed vs under-proofed — how to tell?",
    ],
    nearMissPosts: [
      { postId: "p-bread", coverage: 0.35 },
      { postId: "p-focaccia", coverage: 0.2 },
    ],
    outline: [
      { heading: "The poke test, done right", note: "Photo cue suggestions." },
      { heading: "Signs of over- vs under-proofing", note: "" },
      { heading: "Temperature + time as a backup", note: "Tie to the Thermapen pick." },
    ],
  },
];

export const gapById = (id: string) => contentGaps.find((g) => g.id === id);

// Premium "AI Full Draft" output — the complete, written-in-your-voice post a gap
// can be turned into (vs. the free scaffold). Higher token cost, so it's metered.
export interface GapArticle {
  wordCount: number;
  readingTime: string;
  intro: string[];
  sections: { heading: string; body: string }[];
}

export const fullArticles: Record<string, GapArticle> = {
  "g-freeze": {
    wordCount: 1840,
    readingTime: "7 min read",
    intro: [
      "Few things are sadder than a beautiful loaf going stale before you can finish it — so let's fix that. Freezing sourdough is genuinely one of the best ways to keep that bakery-fresh crumb on hand, as long as you do it right.",
      "Below is exactly how I freeze, store, and revive every loaf from this site, whether you're stashing a fully baked round or saving shaped dough for a busy week.",
    ],
    sections: [
      { heading: "Freezing baked vs. unbaked dough", body: "You can freeze either, and I do both depending on the week. A fully baked, completely cooled loaf freezes beautifully for ready-to-eat bread; shaped, unbaked dough freezes too, but the rise is a touch less lively after thawing — so I save that route for emergencies and freeze most loaves already baked." },
      { heading: "How to wrap and store for the best crust", body: "Cool the loaf completely first — wrapping while it's warm traps steam and softens that crackly shell you worked for. Then wrap tightly in a layer of parchment and a layer of foil, or slide it into a freezer bag with the air pressed out. For slices, freeze them flat on a tray before bagging so they don't fuse into a brick." },
      { heading: "The reheating method that revives the crust", body: "This is the step everyone misses. Don't microwave a whole loaf — it goes gummy. Instead, thaw at room temperature, then bake straight from frozen or thawed at 375°F for 8–12 minutes. The dry oven heat re-crisps the shell and brings back that just-out-of-the-oven snap." },
      { heading: "How long it actually keeps", body: "Quality stays excellent for about a month and is still good to three. Past that it's perfectly safe but the crumb dries out, so I label every bag with the date and rotate oldest-first." },
    ],
  },
  "g-altitude": {
    wordCount: 1620,
    readingTime: "6 min read",
    intro: [
      "If your loaves are sinking, overflowing, or drying out at elevation, it's almost never your fault — it's the altitude. Lower air pressure changes how dough rises and how fast moisture evaporates, and a few small tweaks set it right.",
      "Here's how I'd adjust the recipes on this site for a higher kitchen, banded by elevation so you can find your number fast.",
    ],
    sections: [
      { heading: "Why altitude changes baking", body: "Above about 3,000 feet, gases expand faster and water boils at a lower temperature, so doughs rise quickly and then collapse, and batters lose moisture before they set. Almost every fix comes down to slowing the rise and adding a little liquid back." },
      { heading: "Adjustments by elevation band", body: "At 3,000–5,000 ft, reduce yeast by about a quarter and add a tablespoon or two of water. At 5,000–7,000 ft, cut yeast by a third, bump the water a bit more, and consider a slightly hotter oven for a faster set. Above 7,000 ft, do all of that and shorten the proof so the dough doesn't outrun itself." },
      { heading: "Recipe-specific notes", body: "For the no-knead bread, the biggest lever is a shorter bulk rise — start checking it hours early. For quick breads like the banana bread, raise the oven 15–25°F and trim the leavening slightly so the loaf doesn't dome up and then sink in the middle." },
    ],
  },
  "g-dairyfree": {
    wordCount: 1490,
    readingTime: "6 min read",
    intro: [
      "A creamy pasta sauce doesn't need dairy to taste rich — it needs fat, salt, and a little body. Once you know which swaps actually behave like cream, the whole category opens back up.",
      "Here are the three dairy-free creams I reach for, ranked by how they taste and how they hold up to heat.",
    ],
    sections: [
      { heading: "The three dairy-free creams, ranked", body: "Soaked cashew cream is my top pick — blended smooth, it's neutral and luxuriously thick. Oat cream is the easiest store-bought option and won't split. Full-fat coconut milk works in a pinch but carries a faint coconut note I only want in certain dishes." },
      { heading: "How to keep the sauce from splitting", body: "Keep the heat at a gentle simmer, never a hard boil, and stir your cream in off the highest heat. A teaspoon of starch slurry or a spoon of starchy pasta water helps everything emulsify and cling to the noodles instead of breaking." },
      { heading: "Exact swaps for the Tuscan chicken", body: "Replace the heavy cream one-to-one with cashew or oat cream, skip the parmesan or use a dairy-free version, and finish with an extra pinch of salt and a squeeze of lemon to wake the whole thing up." },
    ],
  },
  "g-proof": {
    wordCount: 1380,
    readingTime: "5 min read",
    intro: [
      "Underproofed bread bakes up dense and tight; overproofed bread spreads and deflates. Learning to read the dough — instead of the clock — is the single biggest upgrade you can make as a baker.",
      "Here's how I judge it every time, with backups for the moments you're just not sure.",
    ],
    sections: [
      { heading: "The poke test, done right", body: "Flour a finger and gently press about half an inch into the dough. If it springs back slowly and leaves a slight dent, it's ready. Springs back instantly? Give it more time. Doesn't spring back at all? It's slightly over — get it in the oven soon." },
      { heading: "Signs of over- vs under-proofing", body: "Underproofed dough looks tight and tears when you shape it; overproofed dough is slack, very bubbly, and may smell sharply sour. You're aiming for the in-between: relaxed, jiggly, and visibly puffed but still holding its shape." },
      { heading: "Temperature and time as a backup", body: "Dough proofs faster in a warm kitchen, so treat any time in a recipe as a rough guide, not a rule. A probe thermometer helps on the back end too — I pull most loaves at 205–210°F internal to confirm they're fully baked through." },
    ],
  },
};

export const fullArticleFor = (id: string) => fullArticles[id];
