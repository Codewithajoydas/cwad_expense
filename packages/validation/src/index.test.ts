import { describe, expect, it } from "vitest";
import { healthResponseSchema, paginationSchema } from "./index.js";

describe("validation", () => {
  it("validates a health response", () => {
    expect(
      healthResponseSchema.parse({
        status: "ok",
        service: "api",
        timestamp: new Date().toISOString(),
      }).status,
    ).toBe("ok");
  });

  it("provides pagination defaults", () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 });
  });
});