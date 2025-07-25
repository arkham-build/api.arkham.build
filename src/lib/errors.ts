import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { statusText } from "./http-status.ts";

export function errorHandler(err: unknown, ctx: Context) {
  if (err instanceof HTTPException) {
    return ctx.json(formatError(err), err.status);
  }

  console.error(err);
  return ctx.json({ message: statusText(500) }, 500);
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
