import { SaxParser } from "@nodable/sax";
import { SyntaxValidator } from "fast-xml-validator";

type Row = Record<string, string>;

const validateXml = (xml: string) => {
  try {
    const result = SyntaxValidator.validate(xml);

    if (result !== true) {
      const { msg, line, col } = result.err;
      throw new Error(`Invalid XML at ${line}:${col}: ${msg}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(`Invalid XML ${message}`, { cause: error });
  }
};

const extractRows = (xml: string, rowElement: string, fields: string[]) => {
  validateXml(xml);

  const rows: Row[] = [];
  const expectedFields = new Set(fields);

  let currentRow: Row | undefined;
  let currentField: string | undefined;
  let currentValue = "";

  const parser = new SaxParser({
    onStartElement(name) {
      if (name === rowElement) currentRow = {};

      if (currentRow && expectedFields.has(name)) {
        currentField = name;
        currentValue = "";
      }
    },
    onText(text) {
      if (currentField) {
        currentValue += text;
      }
    },
    onCData(text) {
      if (currentField) {
        currentValue += text;
      }
    },
    onEndElement(name) {
      if (currentRow && name === currentField) {
        currentRow[name] = currentValue.trim();
        currentField = undefined;
      }

      if (name === rowElement && currentRow) {
        rows.push(currentRow);
        currentRow = undefined;
      }
    },
  });
  parser.parse(xml);

  return rows;
};

const makeDict = {
  ALL_VEHICLE_MAKES: "AllVehicleMakes",
  MAKE_ID: "Make_ID",
  MAKE_NAME: "Make_Name",
} as const;

export const parseMakesXml = (xml: string) => {
  return extractRows(xml, makeDict.ALL_VEHICLE_MAKES, [
    makeDict.MAKE_ID,
    makeDict.MAKE_NAME,
  ])
    .map((row) => ({
      id: Number(row.Make_ID),
      name: row.Make_Name?.trim() ?? "",
    }))
    .filter((make) => {
      const isValidMake = Number.isInteger(make.id) && make.name.length > 0;
      return isValidMake;
    });
};

const vehicleDict = {
  VEHICLE_TYPES_FOR_MAKE_IDS: "VehicleTypesForMakeIds",
  VEHICLE_TYPE_ID: "VehicleTypeId",
  VEHICLE_TYPE_NAME: "VehicleTypeName",
};

export const parseVehicleTypesXml = (xml: string) => {
  return extractRows(xml, vehicleDict.VEHICLE_TYPES_FOR_MAKE_IDS, [
    vehicleDict.VEHICLE_TYPE_ID,
    vehicleDict.VEHICLE_TYPE_NAME,
  ])
    .map((row) => ({
      id: Number(row.VehicleTypeId),
      name: row.VehicleTypeName?.trim() ?? "",
    }))
    .filter((vehicleType) => {
      const isValidVehicleType =
        Number.isInteger(vehicleType.id) && vehicleType.name.length > 0;

      return isValidVehicleType;
    });
};
