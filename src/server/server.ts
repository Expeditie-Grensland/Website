import { dirname, join } from "node:path";
import { setupFastify, setupMongooose } from "./helpers/setup.js";

import { fileURLToPath } from "node:url";
Error.stackTraceLimit = Infinity;

global.rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

await setupMongooose();
await setupFastify();
