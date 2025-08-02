import { describe, expect } from "vitest";
import { test } from "./test-utils.ts";

describe("POST /v2/public/recommendations", () => {
  test.fails(
    "returns a 200 for a well-formed request",
    async ({ dependencies }) => {
      const res = await dependencies.app.request(
        "/v2/public/recommendations/03006-03006",
        {
          method: "GET",
        },
      );

      expect(res.status).toEqual(200);
    },
  );
});
