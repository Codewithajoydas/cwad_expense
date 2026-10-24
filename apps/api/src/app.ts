import compression from "compression";
import cors from "cors";
import express from "express";
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
import transactionRoutes from "./routes/transaction.routes.js";
import accountRoutes from "./routes/account.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import userDataRoutes from "./routes/user-data.routes.js";

const app = express();

let databaseConnection: Promise<unknown> | undefined;

function ensureDatabaseConnection() {
  if (!databaseConnection) {
    databaseConnection = connectToMongoDB().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }

  return databaseConnection;
}

app.disable("x-powered-by");

app.use(requestIdMiddleware);

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



app.use(pinoHttp({ logger }));


app.get("/", (_req, res) => {
  res.json({
    name: "CWAD React + Express API",
    version: "1.0.0",
    status: "running",
  });
});


app.use(async (_req, res, next) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (error) {
    next(error);
  }
});


app.use("/api/v1", healthRouter);
app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/data", userDataRoutes);


app.use(notFoundMiddleware);
app.use(errorHandler);


export default app;



export async function createApp() {
  await ensureDatabaseConnection();
  return app;
}