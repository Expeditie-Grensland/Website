import { dirname, join } from "node:path";
import { migrateDatabase, setupFastify } from "./helpers/setup.js";

import { fileURLToPath } from "node:url";
Error.stackTraceLimit = Infinity;

global.rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

await migrateDatabase();
await setupFastify();
