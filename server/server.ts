import * as express from 'express';
import * as http from 'http';
import * as socket from 'socket.io';

import { Setup } from './setup';
import { Router } from './routes';
import { config } from './helpers/configHelper';
import { SocketHandler } from './sockets/socketHandler';
import { ColorHelper } from './helpers/colorHelper';

import 'source-map-support/register'

Error.stackTraceLimit = Infinity;

const app = express();
const server = http.createServer(app);
const io = socket(server);
const dev = (app.get('env') == 'development');

// FIXME: if mongo can't reach models, server crashes
Setup.setupExpress(app, __dirname + '/../');
Setup.setupDatabase(app, config.mongo, dev);

SocketHandler.bindHandlers(app, io);

app.use('/', Router(dev));
ColorHelper.init();

Setup.startServer(server, config.port);

console.info('Server started on port: ' + config.port);
