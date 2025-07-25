import { z } from "zod";

export const encounterSetSchema = z.object({
  code: z.string().max(255),
  pack_code: z.string().max(36),
  real_name: z.string().max(255),
  translations: z.array(
    z.object({
      name: z.string().max(255),
      locale: z.string().max(10),
    }),
  ),
});

export type EncounterSet = z.infer<typeof encounterSetSchema>;
