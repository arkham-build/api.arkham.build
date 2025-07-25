import { z } from "zod";

const slotsSchema = z.record(z.string(), z.number().int());

export const arkhamDBDecklistSchema = z.object({
  id: z.number(),
  name: z.string().max(255),
  date_creation: z.string(),
  date_update: z.string().nullish(),
  description_md: z.string().nullish(),
  user_id: z.number(),
  investigator_code: z.string().max(36),
  investigator_name: z.string().max(255),
  slots: slotsSchema,
  side_slots: slotsSchema.nullish(),
  ignore_deck_limit_slots: slotsSchema.nullish(),
  version: z.string().max(8).nullish(),
  xp: z.number().nullish(),
  xp_spent: z.number().nullish(),
  xp_adjustment: z.number().nullish(),
  exile_string: z.string().nullish(),
  taboo_id: z.number().nullish(),
  meta: z.record(z.string(), z.unknown()).nullish(),
  tags: z.string().nullish(),
  previous_deck: z.number().nullish(),
  next_deck: z.number().nullish(),
  canonical_investigator_code: z.string().max(73),
  like_count: z.number().default(0),
});

export type ArkhamDBDecklist = z.infer<typeof arkhamDBDecklistSchema>;
