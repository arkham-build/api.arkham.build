import type { Context, Next } from "hono";
import type { HonoEnv } from "./hono-env.ts";

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogMessage = {
  level: LogLevel;
  msg: string;
  details?: {
    [key: string]: unknown;
  };
};

export function log(message: Record<string, unknown>) {
  message["timestamp"] = new Date().toISOString();
  console.log(JSON.stringify(message));
}

type Logger = (message: Omit<LogMessage, "timestamp">) => void;

export function logger() {
  return async (c: Context<HonoEnv>, next: Next) => {
    const requestId = c.get("requestId");
    const clientId = c.header("X-Client-Id");

    const logger: Logger = (message) => {
      message.details ??= {};
      message.details["request_id"] = requestId;
      message.details["client_id"] = clientId;
      log(message);
    };

    c.set("logger", logger);

    return next();
  };
}

export function requestLogger() {
  return async (c: Context<HonoEnv>, next: Next) => {
    const begin = Date.now();

    await next();

    // don't log successful health checks
    if (c.req.path !== "/version" || c.res.status !== 200) {
      c.get("logger")({
        level: "info",
        msg: `${c.req.method} ${c.req.path}`,
        details: {
          duration_ms: Date.now() - begin,
          method: c.req.method,
          status: c.res.status,
          url: c.req.url,
        },
      });
    }
  };
}
