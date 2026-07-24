import assert from "node:assert/strict";
import test from "node:test";

import { Test } from "@nestjs/testing";

import { VehicleRepository } from "../../src/database/vehicle.repository.js";
import { NhtsaService } from "../../src/nhtsa/nhtsa.service.js";
import type { VehicleData } from "../../src/vehicles/vehicle.types.js";
import { VehiclesService } from "../../src/vehicles/vehicles.service.js";

test("ingests and persists vehicle data", async () => {
  const vehicleData: VehicleData = {
    ingestedAt: "2026-07-24T00:00:00.000Z",
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
  };

  let persistedData: VehicleData | undefined;

  const testingModule = await Test.createTestingModule({
    providers: [
      VehiclesService,
      {
        provide: NhtsaService,
        useValue: {
          fetchVehicleData: async () => vehicleData,
        },
      },
      {
        provide: VehicleRepository,
        useValue: {
          replace(data: VehicleData) {
            persistedData = data;
          },

          listMakes() {
            return vehicleData.makes;
          },
        },
      },
    ],
  }).compile();

  const service = testingModule.get(VehiclesService);

  const result = await service.ingestVehicleData();

  assert.equal(result, vehicleData);
  assert.equal(persistedData, vehicleData);

  await testingModule.close();
});

test("retrieves makes through the repository", async () => {
  const expectedMakes = [
    {
      id: 440,
      name: "Acura",
      vehicleTypes: [],
    },
  ];

  let receivedOptions: unknown;

  const testingModule = await Test.createTestingModule({
    providers: [
      VehiclesService,
      {
        provide: NhtsaService,
        useValue: {},
      },
      {
        provide: VehicleRepository,
        useValue: {
          replace() {},

          listMakes(options: unknown) {
            receivedOptions = options;
            return expectedMakes;
          },
        },
      },
    ],
  }).compile();

  const service = testingModule.get(VehiclesService);

  const result = service.getMakes({
    makeId: 440,
  });

  assert.deepEqual(result, expectedMakes);
  assert.deepEqual(receivedOptions, {
    makeId: 440,
  });

  await testingModule.close();
});
