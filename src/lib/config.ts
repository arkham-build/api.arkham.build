import * as z from "zod";

export const configSchema = z.object({
  CORS_ORIGINS: z.string(),
  DATA_API_URL: z.string().default("https://gapi.arkhamcards.com/v1/graphql"),
  DATA_LOCALES: z.string().default("en"),
  DATA_VERSION: z.coerce.number().int().default(8),
  DATABASE_URL: z.string(),
  HOSTNAME: z.string().default("localhost"),
  PORT: z.coerce.number().min(1).max(65535),
});

export type Config = z.infer<typeof configSchema>;

const config = configSchema.parse(process.env);
export default config;
