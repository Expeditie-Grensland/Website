import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { migrateDatabase, setupFastify } from "./helpers/setup.js";

Error.stackTraceLimit = Infinity;

global.rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

await migrateDatabase();
await setupFastify();
