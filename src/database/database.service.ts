import fs from "node:fs";
import path from "node:path";

import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import SQLite from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { logger } from "../logger.js";
import {
  DATABASE_OPTIONS,
  type DatabaseOptions,
} from "./database.constants.js";
import * as schema from "./schema.js";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly sqlite: SQLite.Database;

  readonly db: BetterSQLite3Database<typeof schema>;

  constructor(
    @Inject(DATABASE_OPTIONS)
    options: DatabaseOptions,
  ) {
    const directory = path.dirname(options.databasePath);

    if (directory !== ".") {
      fs.mkdirSync(directory, {
        recursive: true,
      });
    }

    this.sqlite = new SQLite(options.databasePath);

    this.sqlite.pragma("journal_mode = WAL");
    this.sqlite.pragma("foreign_keys = ON");

    this.db = drizzle(this.sqlite, {
      schema,
    });

    migrate(this.db, {
      migrationsFolder: options.migrationsPath,
    });

    logger.info(
      {
        databasePath: options.databasePath,
      },
      "Database initialized",
    );
  }

  close() {
    this.sqlite.close();

    logger.info("Database connection closed.");
  }

  onModuleDestroy() {
    this.close();
  }
}
