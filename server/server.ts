import * as express from "express"
import * as http from "http"
import * as socket from "socket.io"
import * as path from "path"

import {Setup} from "./Setup"
import {Routes} from "./routes/Routes"
import {Config} from "./Config"
import {SocketHandler} from "./sockets/SocketHandler"
import {ColorHelper} from "./helper/ColorHelper"

Error.stackTraceLimit = Infinity

const app = express()
const server = http.createServer(app)
const io = socket(server)

const db = Setup.setupDatabase(Config.db.address, Config.db.port, Config.db.db, Config.db.user.name, Config.db.user.password)
//TODO: if mongo can't reach database, server crashes

Setup.setupExpress(app, __dirname + "/../")
Setup.setupAuthGoogle(Config.auth.id, Config.auth.secret)
//Setup.setupSession(app, io)
Setup.addAuthMiddleware(app)
Setup.addAsMiddleware(app, "db", db)

SocketHandler.bindHandlers(app, io)

Routes.init(app)
ColorHelper.init()

Setup.startServer(server)

console.log("Server started on port: " + Config.port)
