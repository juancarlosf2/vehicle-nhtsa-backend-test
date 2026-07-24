import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { IngestionModule } from "./ingestion/ingestion.module.js";
import { logger } from "./logger.js";
import { VehiclesService } from "./vehicles/vehicles.service.js";

async function ingest(): Promise<void> {
  const application = await NestFactory.createApplicationContext(
    IngestionModule,
    {
      logger: false,
    },
  );

  try {
    logger.info("Starting vehicle data ingestion");

    const vehiclesService = application.get(VehiclesService);

    const result = await vehiclesService.ingestVehicleData();

    logger.info(
      {
        makeCount: result.makes.length,
        ingestedAt: result.ingestedAt,
      },
      "Vehicle data ingestion command completed",
    );
  } finally {
    await application.close();
  }
}

ingest().catch((error: unknown) => {
  logger.fatal(
    {
      err: error,
    },
    "Vehicle data ingestion command failed",
  );

  process.exitCode = 1;
});
