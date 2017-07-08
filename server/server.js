"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const path = require("path");
const setup_1 = require("./setup");
const socketHandler_1 = require("./sockets/socketHandler");
const routes_1 = require("./routes/routes");
const app = express();
const server = http.createServer(app);
const io = socket(server);
const root = __dirname;
const viewsDir = path.join(root, 'views');
const publicDir = path.join(root, 'public');
//const db = Setup.setupDatabase(Config.db.address, Config.db.port, Config.db.db, Config.db.user.name, Config.db.user.password)
setup_1.Setup.setupExpress(app, __dirname + "/../");
//Setup.setupAuthGoogle(Config.auth.id, Config.auth.secret)
//Setup.setupSession(app, io)
//Setup.addAuthMiddleware(app)
//Setup.addAsMiddleware(app, "db", db)
socketHandler_1.SocketHandler.bindHandlers(app, io);
routes_1.Routes.init(app);
setup_1.Setup.startServer(server);
