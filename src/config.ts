export const config = {
  port: Number(process.env.PORT ?? 4000),
  environment: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 15_000),

  // for the test purposes I am submitting the real URL but I will patch this in a future commit after the test review is done
  makesUrl:
    process.env.MAKES_URL ??
    "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML",

  vehicleTypesUrl:
    process.env.VEHICLE_TYPES_URL ??
    "https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId",
};
