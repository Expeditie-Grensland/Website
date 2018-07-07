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

const db = Setup.setupDatabase(app, Config.database.host, Config.database.port, Config.database.db, Config.database.user, Config.database.pass)
//TODO: if mongo can't reach database, server crashes

Setup.setupExpress(app, __dirname + "/../")
Setup.addAsMiddleware(app, "db", db)

SocketHandler.bindHandlers(app, io)

Routes.init(app)
ColorHelper.init()

Setup.startServer(server)

console.log("Server started on port: " + Config.port)
