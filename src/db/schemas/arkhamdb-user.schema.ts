import { z } from "zod";

export const arkhamDBUserSchema = z.object({
  id: z.number(),
  name: z.string().max(255),
  reputation: z.number().default(0),
});

export type ArkhamDBUser = z.infer<typeof arkhamDBUserSchema>;
