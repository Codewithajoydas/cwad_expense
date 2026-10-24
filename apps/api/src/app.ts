import compression from "compression";
import cors from "cors";
import express from "express";
import { default as helmet } from "helmet";
import { rateLimit } from "express-rate-limit";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";

import { env } from "./config/env.config.js";
import { logger } from "./config/logger.config.js";
import { connectToMongoDB } from "./config/db.config.js";
import { auth } from "./lib/auth.lib.js";

import { errorHandler } from "./middlewares/error-handler.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { requestIdMiddleware } from "./middlewares/request-id.middleware.js";

import { healthRouter } from "./routes/health.routes.js";

//=============================ROUTES====================================//
import transactionRoutes from "./routes/transaction.routes.js";
import accountRoutes from "./routes/account.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import userDataRoutes from "./routes/user-data.routes.js";
//=============================ROUTES====================================//

export async function createApp() {
  await connectToMongoDB();
  const app = express();

  app.disable("x-powered-by");

  app.use(requestIdMiddleware);
  app.use(helmet());

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(compression());

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json({ limit: "1mb" }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  // @ts-ignore
  app.use(pinoHttp({ logger }));

  app.get("/", (_req, res) => {
    res.json({
      name: "CWAD React + Express API",
      version: "1.0.0",
      status: "running",
    });
  });

  app.use("/api/v1", healthRouter);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/accounts", accountRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/data", userDataRoutes);
  app.use(notFoundMiddleware);
  app.use(errorHandler);

  return app;
}
