import { z } from "zod";

export const cycleSchema = z.object({
  code: z.string().max(36),
  position: z.number(),
  real_name: z.string().max(255),
  translations: z.array(
    z.object({
      name: z.string().max(255),
      locale: z.string().max(10),
    }),
  ),
});

export type Cycle = z.infer<typeof cycleSchema>;
