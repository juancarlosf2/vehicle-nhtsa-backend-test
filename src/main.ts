import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  app.enableShutdownHooks();
  await app.listen(config.port);

  logger.info(
    {
      port: config.port,
      environment: config.environment,
    },
    "NestJS server started",
  );
};

bootstrap().catch((err: unknown) => {
  logger.fatal(
    {
      err,
    },
    "NestJS server failed to start",
  );

  process.exitCode = 1;
});
