import { afterEach } from "node:test";
import { describe, expect, it } from "vitest";
import { getTestApp } from "./test-utils.ts";

afterEach(async () => {
  await globalThis.postgresContainer?.restoreSnapshot();
});

describe("GET /recommendations", () => {
  const app = getTestApp();

  it("works", async () => {
    const res = await app.request("/recommendations", {
      method: "POST",
    });
    expect(res.status).toEqual(400);
  });
});
