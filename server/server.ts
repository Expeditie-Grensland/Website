import * as express from 'express'
import * as http from 'http'
import * as socket from 'socket.io'
import * as path from 'path'

import {Setup} from "./Setup"
import {SocketHandler} from "./sockets/SocketHandler"
import {Routes} from "./routes/Routes"
import {Config} from "./Config"

const app = express()
const server = http.createServer(app)
const io = socket(server)

const root = __dirname
const viewsDir = path.join(root, 'views')
const publicDir = path.join(root, 'public')

//const db = Setup.setupDatabase(Config.db.address, Config.db.port, Config.db.db, Config.db.user.name, Config.db.user.password)

Setup.setupExpress(app, __dirname + "/../")
//Setup.setupAuthGoogle(Config.auth.id, Config.auth.secret)
//Setup.setupSession(app, io)
//Setup.addAuthMiddleware(app)
//Setup.addAsMiddleware(app, "db", db)

SocketHandler.bindHandlers(app, io)

Routes.init(app)

Setup.startServer(server)

console.log("Server started on port: " + Config.port)