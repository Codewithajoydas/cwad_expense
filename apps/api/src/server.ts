import {createApp } from "./app.js";
import { env } from "./config/env.config.js";
import { logger } from "./config/logger.config.js";

const app = await createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on http://localhost:${env.PORT}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received. Starting graceful shutdown.`);

  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));