import { PageHeader, PageBody } from "@/components/dashboard/primitives";
import { WidgetStudio } from "@/components/dashboard/widget-studio";

export const metadata = { title: "Widget Studio — Visitor Intelligence" };

export default function WidgetPage() {
  return (
    <PageBody>
      <PageHeader
        kicker="Widget Studio"
        title="Shape your widget"
        description="Appearance, voice, suggested questions, and your affiliate-surfacing rules — with a live preview. The install snippet is the same one line, on any CMS."
      />
      <div className="mt-6">
        <WidgetStudio />
      </div>
    </PageBody>
  );
}
