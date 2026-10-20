import type { Request, Response } from "express";
import type { HealthResponse } from "@cwad/types";
import { getHealthStatus, getReadinessStatus } from "../services/health.service.js";

export function healthController(_req: Request, res: Response<HealthResponse>) {
  res.status(200).json(getHealthStatus());
}

export function readinessController(_req: Request, res: Response) {
  res.status(200).json(getReadinessStatus());
}