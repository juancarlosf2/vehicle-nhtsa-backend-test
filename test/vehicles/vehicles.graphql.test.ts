import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { Test } from "@nestjs/testing";

import { VehiclesResolver } from "../../src/vehicles/vehicles.resolver.js";
import { VehiclesService } from "../../src/vehicles/vehicles.service.js";

test("retrieves stored makes through GraphQL", async () => {
  const testingModule = await Test.createTestingModule({
    imports: [
      GraphQLModule.forRoot<ApolloDriverConfig>({
        driver: ApolloDriver,
        autoSchemaFile: true,
      }),
    ],
    providers: [
      VehiclesResolver,
      {
        provide: VehiclesService,
        useValue: {
          getMakes() {
            return [
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
            ];
          },
        },
      },
    ],
  }).compile();

  const app = testingModule.createNestApplication();

  await app.listen(0, "127.0.0.1");

  const address = app.getHttpServer().address() as AddressInfo;

  const response = await fetch(`http://127.0.0.1:${address.port}/graphql`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `
          query {
            makes {
              id
              name
              vehicleTypes {
                id
                name
              }
            }
          }
        `,
    }),
  });

  const body = await response.json();

  assert.equal(response.status, 200);

  assert.deepEqual(body, {
    data: {
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
    },
  });

  await app.close();
});
