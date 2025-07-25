import { z } from "zod";

export const typeSchema = z.object({
  code: z.string().max(36),
  name: z.string().max(255),
});

export type Type = z.infer<typeof typeSchema>;
