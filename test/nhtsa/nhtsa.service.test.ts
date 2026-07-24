import assert from "node:assert/strict";
import test from "node:test";

import { Test } from "@nestjs/testing";

import { config } from "../../src/config.js";
import { NHTSA_FETCH, type FetchLike } from "../../src/nhtsa/constants.js";
import { NhtsaService } from "../../src/nhtsa/nhtsa.service.js";

const makesXml = `
  <Response>
    <Results>
      <AllVehicleMakes>
        <Make_ID>440</Make_ID>
        <Make_Name>Acura</Make_Name>
      </AllVehicleMakes>
    </Results>
  </Response>
`;

const vehicleTypesXml = `
  <Response>
    <Results>
      <VehicleTypesForMakeIds>
        <VehicleTypeId>2</VehicleTypeId>
        <VehicleTypeName>Passenger Car</VehicleTypeName>
      </VehicleTypesForMakeIds>
    </Results>
  </Response>
`;

test("downloads and combines NHTSA data", async () => {
  const requestedUrls: string[] = [];

  const fetchMock = (async (input) => {
    const url = input.toString();
    requestedUrls.push(url);

    const body = url.includes("getallmakes") ? makesXml : vehicleTypesXml;

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/xml",
      },
    });
  }) as FetchLike;

  const testingModule = await Test.createTestingModule({
    providers: [
      NhtsaService,
      {
        provide: NHTSA_FETCH,
        useValue: fetchMock,
      },
    ],
  }).compile();

  const service = testingModule.get(NhtsaService);

  const result = await service.fetchVehicleData();

  assert.deepEqual(result.makes, [
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
  ]);

  assert.equal(requestedUrls.length, 2);
  assert.match(result.ingestedAt, /^\d{4}-\d{2}-\d{2}T/);

  await testingModule.close();
});

test("limits concurrent vehicle type requests", async () => {
  const makeCount = config.vehicleTypesConcurrency * 2 + 1;
  const manyMakesXml = `
    <Response>
      <Results>
        ${Array.from(
          { length: makeCount },
          (_, index) => `
            <AllVehicleMakes>
              <Make_ID>${index + 1}</Make_ID>
              <Make_Name>Make ${index + 1}</Make_Name>
            </AllVehicleMakes>
          `,
        ).join("")}
      </Results>
    </Response>
  `;

  let activeRequests = 0;
  let peakActiveRequests = 0;

  const fetchMock = (async (input) => {
    const url = input.toString();

    if (url.includes("getallmakes")) {
      return new Response(manyMakesXml, { status: 200 });
    }

    activeRequests += 1;
    peakActiveRequests = Math.max(peakActiveRequests, activeRequests);

    await new Promise((resolve) => setTimeout(resolve, 5));
    activeRequests -= 1;

    return new Response(vehicleTypesXml, { status: 200 });
  }) as FetchLike;

  const testingModule = await Test.createTestingModule({
    providers: [
      NhtsaService,
      {
        provide: NHTSA_FETCH,
        useValue: fetchMock,
      },
    ],
  }).compile();

  const service = testingModule.get(NhtsaService);
  const result = await service.fetchVehicleData();

  assert.equal(result.makes.length, makeCount);
  assert.ok(
    peakActiveRequests <= config.vehicleTypesConcurrency,
    `Expected at most ${config.vehicleTypesConcurrency} concurrent requests, received ${peakActiveRequests}`,
  );

  await testingModule.close();
});
