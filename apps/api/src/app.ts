import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundMiddleware } from "./middlewares/not-found.js";
import { requestIdMiddleware } from "./middlewares/request-id.js";
import { healthRouter } from "./routes/health.routes.js";

export const app = express();

app.disable("x-powered-by");

app.use(requestIdMiddleware);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.use(pinoHttp({ logger }));

app.get("/", (_req, res) => {
  res.json({
    name: "CWAD React + Express API",
    version: "1.0.0",
    status: "running",
  });
});

app.use("/api/v1", healthRouter);

app.use(notFoundMiddleware);
app.use(errorHandler);