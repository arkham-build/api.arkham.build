import { z } from "zod";

export const subtypeSchema = z.object({
  code: z.string().max(36),
  name: z.string().max(255),
});

export type Subtype = z.infer<typeof subtypeSchema>;
