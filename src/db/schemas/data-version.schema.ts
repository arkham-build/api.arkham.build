import { z } from "zod";

export const dataVersionSchema = z.object({
  card_count: z.number(),
  cards_updated_at: z.string(),
  locale: z.string().max(10),
  translation_updated_at: z.string(),
});

export type DataVersion = z.infer<typeof dataVersionSchema>;
