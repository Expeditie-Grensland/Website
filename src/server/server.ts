import * as express from 'express';
import * as http from 'http';

import {
    setupExpress,
    setupSession,
    addAuthMiddleware,
    setupDatabase,
    startServer,
} from './setup';
import { Router } from './routes';
import { config } from './helpers/configHelper';

import 'source-map-support/register';
import updateDatabase from './databaseUpdate';

Error.stackTraceLimit = Infinity;

const app = express();
const server = http.createServer(app);
const dev = app.get('env') == 'development';

// FIXME: if mongo can't reach models, server crashes
setupExpress(app, __dirname + '/../', dev);
setupSession(app);
addAuthMiddleware(app);
setupDatabase(app, dev);

app.use('/', Router());

updateDatabase().then(() => {
    startServer(server, config.port);

    console.info('Server started on port: ' + config.port);
});
