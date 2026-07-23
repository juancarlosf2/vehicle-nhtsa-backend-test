import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { logger } from "./logger.js";

@Injectable()
export class AppLifecycleSerice implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string): void {
    logger.info({ signal: signal ?? "unknown" }, "NestyJS server stopped");
  }
}
