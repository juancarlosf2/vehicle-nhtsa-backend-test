import assert from "node:assert/strict";
import test from "node:test";

import { Test } from "@nestjs/testing";

import { DATABASE_OPTIONS } from "../../src/database/database.constants.js";
import { DatabaseModule } from "../../src/database/database.module.js";
import { VehicleRepository } from "../../src/database/vehicle.repository.js";

test("persists and retrieves transformed data", async () => {
  const testingModule = await Test.createTestingModule({
    imports: [DatabaseModule],
  })
    .overrideProvider(DATABASE_OPTIONS)
    .useValue({
      databasePath: ":memory:",
      migrationsPath: "./drizzle",
    })
    .compile();

  const repository = testingModule.get(VehicleRepository);

  repository.replace({
    ingestedAt: "2026-01-01T00:00:00.000Z",
    makes: [
      {
        id: 440,
        name: "Acura",
        vehicleTypes: [
          {
            id: 2,
            name: "Passenger Car",
          },
        ],
      },
    ],
  });

  assert.deepEqual(
    repository.listMakes({
      makeId: 440,
    }),
    [
      {
        id: 440,
        name: "Acura",
        vehicleTypes: [
          {
            id: 2,
            name: "Passenger Car",
          },
        ],
      },
    ],
  );

  await testingModule.close();
});
