# Vehicle Data Service

A Typescript Backend using NestJS to process the NHTSA service for a test.

### Status

Early stage of development.

### Planned features

- Fetch vehicle makes and types from NHTSA XML APIs
- Parse XML responses into a json structure
- Persist vehicle data with SQLite and Drizzle ORM
- Expose stored data through GraphQL
- Run as a NestJS application
- Support docker local development

### Requirements

- Node.js 22 or newer
- npm

### Local development

```sh
npm install
npm run build
npm start
```

### Environment variables

# Application environment

- NODE_ENV
- PORT
- LOG_LEVEL

### Database Model

- makes | Stores NHTSA vehicle manufacturers
- vehicle_types | Stores vehicle types associated with each make
- ingestion_runs | This one records successful ingestion timestamps
