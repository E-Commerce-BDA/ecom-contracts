import { z } from "zod";

/**
 * Shared FAQ item — used by CMS pages (`faq` blocks) and PDP FAQ sections
 * (`pdp_faq`). Extracted from `pages.ts` in 1.14.0 so section content does
 * not import a page schema.
 */
export const faqItemSchema = z
  .object({
    question: z.string().min(1).max(240),
    answer: z.string().min(1).max(5000),
  })
  .strict();

export type FaqItem = z.infer<typeof faqItemSchema>;
