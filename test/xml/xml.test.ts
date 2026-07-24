import assert from "node:assert/strict";
import test from "node:test";
import { parseMakesXml, parseVehicleTypesXml } from "../../src/xml.js";

test("parses vehicle makes", () => {
  const xml = `
    <Response>
      <Results>
        <AllVehicleMakes>
          <Make_ID>440</Make_ID>
          <Make_Name>Acura</Make_Name>
        </AllVehicleMakes>
      </Results>
    </Response>
  `;

  assert.deepEqual(parseMakesXml(xml), [{ id: 440, name: "Acura" }]);
});

test("parses vehicle type", () => {
  const xml = `
    <Response>
      <Results>
        <VehicleTypesForMakeIds>
          <VehicleTypeId>1</VehicleTypeId>
          <VehicleTypeName>Car</VehicleTypeName>
        </VehicleTypesForMakeIds>
        <VehicleTypesForMakeIds>
          <VehicleTypeId>invalid</VehicleTypeId>
        </VehicleTypesForMakeIds>
      </Results>
    </Response>`;

  assert.deepEqual(parseVehicleTypesXml(xml), [{ id: 1, name: "Car" }]);
});
