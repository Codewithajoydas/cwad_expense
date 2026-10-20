import { useEffect, useState } from "react";
import type { HealthResponse } from "@cwad/types";
import { getHealth } from "../../lib/api-client";

export function HealthCard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  if (error) {
    return <div className="card error">API unavailable: {error}</div>;
  }

  if (!health) {
    return <div className="card">Checking API...</div>;
  }

  return (
    <div className="card">
      <span className="status">API {health.status}</span>
      <p>Service: {health.service}</p>
      <small>{health.timestamp}</small>
    </div>
  );
}