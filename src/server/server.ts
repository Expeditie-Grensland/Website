import express from 'express';
import http from 'node:http';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from './helpers/configHelper.js';
import { Router } from './routes/index.js';
import {
    addAuthMiddleware,
    setupDatabase,
    setupExpress,
    setupSession,
    startServer,
} from './setup.js';

import 'source-map-support/register.js';
import updateDatabase from './databaseUpdate/index.js';

Error.stackTraceLimit = Infinity;

const app = express();
const server = http.createServer(app);
const dev = app.get('env') == 'development';

// FIXME: if mongo can't reach models, server crashes
setupExpress(app, dirname(fileURLToPath(import.meta.url)) + '/../', dev);
setupSession(app);
addAuthMiddleware(app);
setupDatabase(app, dev);

app.use('/', Router());

await updateDatabase();
startServer(server, config.port);
console.info(`Server started on port: ${config.port}`);
