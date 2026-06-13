import { defaultSchema } from "rehype-sanitize";

type Schema = typeof defaultSchema;

/**
 * Sanitization schema for article HTML.
 *
 * Extends the GitHub-flavoured default schema (which already strips `<script>`,
 * inline event handlers, `javascript:` URLs, etc.) so that the site's custom
 * rich blocks survive sanitization:
 *
 *   - fold / hide          → <details class="md-fold|md-hide"><summary>
 *   - tabs                 → <div class="md-tabs" data-md-tabs><div class="md-tab" data-tab-label>
 *   - inline spoiler       → <span class="md-spoiler" tabindex="0">
 *   - theorem / proposition→ <div class="math-callout math-callout--*">
 *
 * Attribute keys use hast property names (camelCase), not raw HTML attribute
 * names: `class` → `className`, `tabindex` → `tabIndex`,
 * `data-tab-label` → `dataTabLabel`, `data-md-tabs` → `dataMdTabs`.
 *
 * Run this BEFORE rehype-slug and rehype-katex so their trusted output
 * (heading ids, KaTeX spans/inline styles) is not stripped, and so heading
 * ids are not rewritten with the default `user-content-` clobber prefix —
 * which would break in-page anchor links and the table of contents.
 */
export const articleSanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "details", "summary"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "className",
      "tabIndex",
      "dataTabLabel",
      "dataMdTabs",
    ],
  },
};
