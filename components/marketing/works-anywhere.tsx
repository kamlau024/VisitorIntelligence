import { Code2 } from "lucide-react";

const CMS = ["WordPress", "Squarespace", "Ghost", "Webflow", "Shopify", "Any HTML site"];

export function WorksAnywhere() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="overflow-hidden rounded-2xl border border-line bg-ink text-paper edge-lg">
        <div className="grid gap-8 p-8 lg:grid-cols-2 lg:items-center lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ochre">
              One script tag. No plugin lock-in.
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Works on whatever you already publish with.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-paper/70">
              Visitor Intelligence learns your site by reading your published
              pages — recipes, affiliate links and all. No database access, no
              theme surgery. Paste one line and you&apos;re live in five minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CMS.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-paper/20 bg-paper/5 px-3 py-1 text-sm text-paper/80"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-paper/15 bg-[#171310] p-4 font-mono text-[13px] leading-relaxed">
            <div className="mb-3 flex items-center gap-2 text-paper/40">
              <Code2 className="size-4" />
              <span className="text-xs">Add before &lt;/body&gt;</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre text-paper/90">
              <code>
                {`<script
  src="https://cdn.visitorintel.io/`}
                <span className="text-ochre">vi-widget.js</span>
                {`"
  data-site-id="`}
                <span className="text-sage">twk_live_a91f</span>
                {`"
  defer
></script>`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
