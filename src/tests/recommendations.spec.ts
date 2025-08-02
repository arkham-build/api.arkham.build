import { describe, expect } from "vitest";
import { test } from "./test-utils.ts";

describe("POST /v2/public/recommendations", () => {
  test("returns a 400 error when request body is missing", async ({
    dependencies,
  }) => {
    const res = await dependencies.app.request("/v2/public/recommendations", {
      method: "POST",
    });

    expect(res.status).toEqual(400);
    expect(await res.json()).toMatchInlineSnapshot(`
      {
        "cause": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Invalid input: expected string, received undefined",
            "path": [
              "canonical_investigator_code",
            ],
          },
        ],
        "message": "Bad Request",
      }
    `);
  });
});
