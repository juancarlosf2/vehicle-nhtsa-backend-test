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
