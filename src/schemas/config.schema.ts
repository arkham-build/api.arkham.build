import * as z from "zod";

export const ConfigSchema = z.object({
  HOSTNAME: z.string().default("localhost"),
  PORT: z.coerce.number().min(1).max(65535),
});

export type Config = z.infer<typeof ConfigSchema>;
