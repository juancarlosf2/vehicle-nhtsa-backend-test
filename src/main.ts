import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  await app.listen(4000);
};

void bootstrap();
