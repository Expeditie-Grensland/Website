import * as express from 'express';
import * as http from 'http';

import { Setup } from './setup';
import { Router } from './routes';
import { config } from './helpers/configHelper';

import 'source-map-support/register';
import updateDatabase from './databaseUpdate';

Error.stackTraceLimit = Infinity;

const app = express();
const server = http.createServer(app);
const dev = (app.get('env') == 'development');

// FIXME: if mongo can't reach models, server crashes
Setup.setupExpress(app, __dirname + '/../', dev);
Setup.setupSession(app);
Setup.addAuthMiddleware(app);
Setup.setupDatabase(app, dev);

app.use('/', Router(dev));

updateDatabase().then(() => {
    Setup.startServer(server, config.port);

    console.info('Server started on port: ' + config.port);
});
