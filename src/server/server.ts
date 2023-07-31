import express from "express";
import http from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "./helpers/configHelper.js";
import { Router } from "./routes/index.js";
import {
    setupDatabase,
    setupExpress,
    setupSession,
    startServer,
} from "./setup.js";

import "source-map-support/register.js";

Error.stackTraceLimit = Infinity;

const app = express();
const server = http.createServer(app);
const dev = app.get("env") == "development";

// FIXME: if mongo can't reach models, server crashes
setupExpress(app, dirname(fileURLToPath(import.meta.url)) + "/../", dev);
setupSession(app);
setupDatabase(dev);

app.use("/", Router());

startServer(server, config.EG_PORT);
