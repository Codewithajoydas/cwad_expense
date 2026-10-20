import { describe, expect, it } from "vitest";
import { getHealthStatus, getReadinessStatus } from "../src/services/health.service.js";

describe("health service", () => {
  it("returns a healthy status", () => {
    expect(getHealthStatus().status).toBe("ok");
  });

  it("returns a ready status", () => {
    expect(getReadinessStatus().status).toBe("ready");
  });
});