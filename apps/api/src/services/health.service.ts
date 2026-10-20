export function getHealthStatus() {
  return {
    status: "ok" as const,
    service: "api",
    timestamp: new Date().toISOString(),
  };
}

export function getReadinessStatus() {
  return {
    status: "ready" as const,
    service: "api",
  };
}