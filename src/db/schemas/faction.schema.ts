import { z } from "zod";

export const factionSchema = z.object({
  code: z.string().max(36),
  is_primary: z.boolean(),
  name: z.string().max(255),
});

export type Faction = z.infer<typeof factionSchema>;
