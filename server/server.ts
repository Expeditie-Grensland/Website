import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';

import { Setup } from './setup';
import { Router } from './routes';
import { config } from './helpers/configHelper';
import { SocketHandler } from './sockets/socketHandler';
import { ColorHelper } from './helpers/colorHelper';

Error.stackTraceLimit = Infinity;

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const dev = (app.get('env') == 'development');

// FIXME: if mongo can't reach models, server crashes
Setup.setupExpress(app, __dirname + '/../');
Setup.setupSession(app, io);
Setup.addAuthMiddleware(app);
Setup.setupDatabase(app, dev);

SocketHandler.bindHandlers(app, io);

app.use('/', Router(dev));
ColorHelper.init();

Setup.startServer(server, config.port);

console.info('Server started on port: ' + config.port);
