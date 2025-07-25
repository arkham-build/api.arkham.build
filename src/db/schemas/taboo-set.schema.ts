import { z } from "zod";

export const tabooSetSchema = z.object({
  card_count: z.number(),
  date: z.string(),
  id: z.number(),
  name: z.string().max(255).nullish(),
});

export type TabooSet = z.infer<typeof tabooSetSchema>;
