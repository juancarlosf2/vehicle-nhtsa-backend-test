FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install --yes --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig.json ./
COPY src ./src
COPY drizzle ./drizzle

RUN npm run build
RUN npm prune --omit=dev \
  && rm -f node_modules/better-sqlite3/prebuilds/linux-arm64.node \
    node_modules/better-sqlite3/prebuilds/linux-x64.node \
  && npm rebuild better-sqlite3 --build-from-source

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_PATH=/app/data/vehicles.db
ENV MIGRATIONS_PATH=/app/drizzle

WORKDIR /app

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle

RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 4000
VOLUME ["/app/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/graphql',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({query:'{ __typename }'})}).then(response=>{if(!response.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/src/main.js"]
