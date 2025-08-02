import { z } from "zod";

export const recommendationsRequestSchema = z.object({
  analyze_side_decks: z.boolean().optional().default(true),
  analysis_algorithm: z
    .enum(["absolute_rank", "percentile_rank"])
    .optional()
    .default("absolute_rank"),
  canonical_investigator_code: z.string().max(73),
  date_range: z
    .tuple([z.coerce.date(), z.coerce.date()])
    .optional()
    .default(
      () =>
        [
          new Date("2016-09"),
          new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        ] as [Date, Date],
    ),
  required_cards: z.array(z.string()).optional().default([]),
});

export type RecommendationsRequest = z.infer<
  typeof recommendationsRequestSchema
>;

export const recommendationsResponseSchema = z.object({
  data: z.object({
    recommendations: z.object({
      decks_analyzed: z.number(),
      recommendations: z.array(
        z.object({
          card_code: z.string().max(36),
          recommendation: z.number(),
        }),
      ),
    }),
  }),
});
