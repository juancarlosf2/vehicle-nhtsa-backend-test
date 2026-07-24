import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { logger } from "./logger.js";

@Injectable()
export class AppLifecycleService implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string): void {
    logger.info({ signal: signal ?? "unknown" }, "NestJS server stopped");
  }
}
