import type { ErrorRequestHandler } from "express";
import { logger } from "../config/logger.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  logger.error({ err: error }, "Unhandled request error");

  res.status(500).json({
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
  });
};