import type { HealthResponse } from "@cwad/types";
import { healthResponseSchema } from "@cwad/validation";
import { env } from "../config/env.js";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getHealth(): Promise<HealthResponse> {
  const data = await request<unknown>("/api/v1/health");
  return healthResponseSchema.parse(data);
}