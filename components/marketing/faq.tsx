import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const ITEMS = [
  {
    q: "Is this just another AI chatbot?",
    a: "No. The chat is the capture mechanism. The product is what happens with the questions: revenue from your surfaced affiliate picks, a first-party intent dashboard, and a content roadmap. A chatbot answers and forgets; Visitor Intelligence turns every question into revenue or your next post.",
  },
  {
    q: "Will it recommend random products or hurt my readers' trust?",
    a: "Never. It only surfaces products you've already recommended in two or more of your own posts, in your own voice, capped at one chip per answer. It reads like a footnote, not an ad. You approve your affiliate inventory during setup.",
  },
  {
    q: "Do I need WordPress?",
    a: "No. Visitor Intelligence is a single script tag that works on WordPress, Squarespace, Ghost, Webflow, Shopify, or any HTML site. It learns your content by reading your published pages — no plugin or database access required.",
  },
  {
    q: "How is this different from Hotjar, Clarity, or GA4?",
    a: "Those tools measure behavior — clicks, scroll, time on page. Visitor Intelligence captures intent — the actual question in the reader's head, which only a chat surface can collect. It's the signal Google stopped sharing when search went zero-click.",
  },
  {
    q: "Will my bill explode as my traffic grows?",
    a: "No. Pricing is flat by plan, not metered per question or per visitor. A mid-tier creator pays $29/month, full stop — under 1% of a typical ad-and-affiliate income at this tier.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 lg:py-24">
      <p className="kicker text-center">Questions, answered</p>
      <h2 className="mt-3 text-center font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
        The honest FAQ
      </h2>
      <div className="mt-10">
        <Accordion type="single" collapsible defaultValue="item-0">
          {ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
