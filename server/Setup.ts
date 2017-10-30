import * as http from "http"
import * as express from "express"
import * as path from "path"
import * as stylus from "stylus"
import * as mongoose from "mongoose"
import * as bodyParser from "body-parser"
import * as session from "express-session"
import * as passport from "passport"
import * as redis from "redis"
import * as redisConnect from "connect-redis"
import * as i18next from "i18next"
import * as i18nextMiddleware from "i18next-express-middleware"
import * as FileSystemBackend from "i18next-node-fs-backend"

import {Config} from "./Config"
import {Routes} from "./routes/Routes"
import {Tables} from "./database/Tables"

const authGoogle = require('passport-google-oauth2')

const useRedis = Config.session.redis
const redisStore = useRedis ? redisConnect(session) : null
const redisClient = useRedis ? redis.createClient() : null

export namespace Setup {
    export function startServer(server: http.Server) {
        server.listen(Config.port)
    }

    export function setupExpress(app: express.Express, root: string) {
        const viewsDir = path.join(root, 'views')
        const publicDir = path.join(root, 'public')

        i18next
            .use(FileSystemBackend)
            .use(i18nextMiddleware.LanguageDetector)
            .init({
                preload:      ['en', 'nl'],
                lowerCaseLng: true,
                fallbackLng:  'en',
                saveMissing:  true,
                backend:      {
                    loadPath:   path.join(root, 'server/locales/{{lng}}/{{ns}}.json'),
                    addPath:    path.join(root, 'server/locales/{{lng}}/{{ns}}.missing.json'),
                    jsonIndent: 2
                }
            });


        app.set('view engine', 'pug')
        app.set('views', viewsDir)
        app.use(i18nextMiddleware.handle(i18next))
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
        app.use(stylus.middleware(publicDir))
        app.use(express.static(publicDir))
    }

    export function setupSession(app: express.Express, io: SocketIO.Server) {
        const sessionData = {
            resave:            false,
            saveUninitialized: false,
            secret:            Config.session.secret
        }

        if (useRedis) {
            sessionData['store'] = new redisStore({
                host:   'localhost',
                port:   Config.redis.port,
                client: redisClient,
                ttl:    Config.redis.ttl
            })
        }

        const sessionMiddle = session(sessionData)
        io.use((socket, next) => sessionMiddle(socket.request, socket.request.res, next))
        app.use(sessionMiddle)
    }

    export function setupDatabase(address: string, port: number, database: string, user: string, password: string): mongoose.Connection {
        //mongoose.Promise = Promise
        mongoose.connect("mongodb://" + address + ":" + port + "/" + database, {user: user, pass: password, useMongoClient: true})
        const db = mongoose.connection

        db.on('error', console.error.bind(console, 'connection error:'))
        db.once('open', function (callback) {
            console.log("Connected to database")
        })

        Tables.initTables()

        return db
    }

    export function setupAuthGoogle(googleID: string, googleSecret: string) {
        const googleLogin = {
            clientID:          googleID,
            clientSecret:      googleSecret,
            callbackURL:       Config.auth.callback + Routes.user.AUTH_CALLBACK,
            passReqToCallback: true
        }

        const handleLogin = (request: express.Request, accessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
                done(null, null) // return db user in second or error in first
            })
        }

        passport.serializeUser((user, done) => done(null, user)) // user to userID
        passport.deserializeUser((user, done) => done(null, user)) // user from userID

        passport.use(new authGoogle.Strategy(googleLogin, handleLogin))
    }

    export function addAuthMiddleware(app: express.Express) {
        app.use(passport.initialize())
        app.use(passport.session())
    }

    export function addAsMiddleware(app: express.Express, name: string, data) {
        app.use((req: express.Request, res: express.Response, next) => {
            req[name] = data
            next()
        })
    }
}
