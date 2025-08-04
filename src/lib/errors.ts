import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import type { HonoEnv } from "./hono-env.ts";
import { statusText } from "./http-status.ts";

export function errorHandler(err: unknown, c: Context<HonoEnv>) {
  if (err instanceof HTTPException) {
    return c.json(formatError(err), err.status);
  }

  const config = c.get("config");
  const logger = c.get("logger");
  logger({
    level: "error",
    msg: "Unhandled error",
    details: {
      error: (err as Error)?.message,
    },
  });

  if (config.NODE_ENV === "production") {
    console.error(err);
  }

  return c.json({ message: statusText(500) }, 500);
}

function formatError(err: HTTPException) {
  return {
    message: err.message || statusText(err.status),
    cause: formatErrorCause(err.cause),
  };
}

function formatErrorCause(cause: unknown) {
  if (cause instanceof ZodError) return cause.issues;
  if (cause instanceof Error) return cause.message;
  return undefined;
}
