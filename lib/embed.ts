import type { CmsKind } from "./mock-data/types";

export const SITE_ID = "twk_live_a91f";
export const CDN = "https://cdn.visitorintel.io/vi-widget.js";

export function snippet(siteId = SITE_ID) {
  return `<script
  src="${CDN}"
  data-site-id="${siteId}"
  defer
></script>`;
}

export interface CmsGuide {
  key: CmsKind;
  label: string;
  steps: string[];
}

export const CMS_GUIDES: CmsGuide[] = [
  {
    key: "wordpress",
    label: "WordPress",
    steps: [
      "In wp-admin, open Appearance → Theme File Editor (or use a header-footer plugin).",
      "Paste the snippet into the footer.php file, just before </body>.",
      "Save. No plugin install or database access required.",
    ],
  },
  {
    key: "squarespace",
    label: "Squarespace",
    steps: [
      "Go to Settings → Advanced → Code Injection.",
      "Paste the snippet into the Footer field.",
      "Save. It applies to every page on your site.",
    ],
  },
  {
    key: "ghost",
    label: "Ghost",
    steps: [
      "Open Settings → Code injection.",
      "Paste the snippet into Site Footer.",
      "Save. Live on all posts and pages instantly.",
    ],
  },
  {
    key: "webflow",
    label: "Webflow",
    steps: [
      "Open Project Settings → Custom Code.",
      "Paste the snippet into the Footer Code field.",
      "Save and publish your site.",
    ],
  },
  {
    key: "shopify",
    label: "Shopify",
    steps: [
      "From Online Store → Themes, choose Edit code.",
      "Open theme.liquid and paste the snippet before </body>.",
      "Save. Works across product and blog pages.",
    ],
  },
  {
    key: "manual",
    label: "Any HTML site",
    steps: [
      "Open your site's base template or layout file.",
      "Paste the snippet immediately before the closing </body> tag.",
      "Deploy. That's it — the widget self-mounts in an isolated shadow DOM.",
    ],
  },
];
