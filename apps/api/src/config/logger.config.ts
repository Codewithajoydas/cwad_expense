import pino from "pino";
import { env } from "./env.config.js";

export const logger = pino({
  level: env.LOG_LEVEL,
});