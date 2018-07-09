import * as express from "express"
import * as http from "http"
import * as socket from "socket.io"

import {Setup} from "./setup"
import {Routes} from "./routes/routes"
import {Config} from "./config"
import {SocketHandler} from "./sockets/socketHandler"
import {ColorHelper} from "./helper/colorHelper"

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
