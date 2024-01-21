#!/usr/bin/env node

import loadEnv from "./loadEnv.js";

await loadEnv(async () => await import("../server.js"));
