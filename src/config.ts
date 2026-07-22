export const config = {
  port: Number(process.env.PORT ?? 4000),
  environment: process.env.NODE_ENV ?? "development",
  logLevel: process.env.LOG_LEVEL ?? "info",
};
