#!/usr/bin/env node
/**
 * Generates convex/_generated/ types locally without requiring Convex deploy keys.
 * This mimics what `npx convex codegen` does but purely locally.
 */
import { readdirSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join, basename, extname } from "path";

const CONVEX_DIR = join(process.cwd(), "convex");
const GENERATED_DIR = join(CONVEX_DIR, "_generated");

// Find all .ts entry point files in convex/ (excluding schema, auth.config, _generated)
const entryFiles = readdirSync(CONVEX_DIR)
  .filter(
    (f) =>
      f.endsWith(".ts") &&
      f !== "schema.ts" &&
      f !== "auth.config.ts" &&
      !f.startsWith("_"),
  )
  .sort();

const modules = entryFiles.map((f) => basename(f, extname(f)));

mkdirSync(GENERATED_DIR, { recursive: true });

// dataModel.ts
writeFileSync(
  join(GENERATED_DIR, "dataModel.ts"),
  `/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run \`npx convex dev\`.
 * @module
 */

import type {
  DataModelFromSchemaDefinition,
  DocumentByName,
  TableNamesInDataModel,
  SystemTableNames,
} from "convex/server";
import type { GenericId } from "convex/values";
import schema from "../schema.js";

export type TableNames = TableNamesInDataModel<DataModel>;
export type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>;
export type Id<TableName extends TableNames | SystemTableNames> = GenericId<TableName>;
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
`,
);

// server.ts
writeFileSync(
  join(GENERATED_DIR, "server.ts"),
  `/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run \`npx convex dev\`.
 * @module
 */

import {
  actionGeneric,
  httpActionGeneric,
  queryGeneric,
  mutationGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
} from "convex/server";
import type {
  ActionBuilder,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

export const query: QueryBuilder<DataModel, "public"> = queryGeneric;
export const internalQuery: QueryBuilder<DataModel, "internal"> = internalQueryGeneric;
export const mutation: MutationBuilder<DataModel, "public"> = mutationGeneric;
export const internalMutation: MutationBuilder<DataModel, "internal"> = internalMutationGeneric;
export const action: ActionBuilder<DataModel, "public"> = actionGeneric;
export const internalAction: ActionBuilder<DataModel, "internal"> = internalActionGeneric;
export const httpAction: HttpActionBuilder = httpActionGeneric;

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
export type DatabaseReader = GenericDatabaseReader<DataModel>;
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
`,
);

// api.ts
const imports = modules
  .map((m) => `import type * as ${m} from "../${m}.js";`)
  .join("\n");

const moduleEntries = modules
  .map((m) => `  ${m}: typeof ${m},`)
  .join("\n");

writeFileSync(
  join(GENERATED_DIR, "api.ts"),
  `/* eslint-disable */
/**
 * Generated \`api\` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run \`npx convex dev\`.
 * @module
 */

import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import { anyApi } from "convex/server";
${imports}

const fullApi: ApiFromModules<{
${moduleEntries}
}> = anyApi as any;

export const api: FilterApi<typeof fullApi, FunctionReference<any, "public">> = anyApi as any;
export const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">> = anyApi as any;
`,
);

console.log(
  `Generated convex/_generated/ with modules: ${modules.join(", ")}`,
);
