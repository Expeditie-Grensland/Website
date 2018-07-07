import * as http from "http"
import * as express from "express"
import * as path from "path"
import * as stylus from "stylus"
import * as mongoose from "mongoose"
import * as bodyParser from "body-parser"
import * as session from "express-session"
import * as i18next from "i18next"
import * as i18nextMiddleware from "i18next-express-middleware"
import * as FileSystemBackend from "i18next-node-fs-backend"

import {Config} from "./Config"
import {Tables} from "./database/Tables"

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
        app.use(bodyParser.json({limit: '80MB'})) //TODO change this to something more sensible after importing.
        app.use(stylus.middleware(publicDir))
        app.use(express.static(publicDir))
    }

    export function setupDatabase(app: express.Express, address: string, port: number, database: string, user: string, password: string): mongoose.Connection {
        mongoose.set('debug', app.get("env") == "development" ? true : false);

        (<any>mongoose).Promise = Promise
        mongoose.connect("mongodb://" + address + ":" + port + "/" + database, {user: user, pass: password, useMongoClient: true})
        const db = mongoose.connection

        db.on('error', console.error.bind(console, 'connection error:'))
        db.once('open', function (callback) {
            console.log("Connected to database")
        })

        Tables.initTables()

        return db
    }

    export function addAsMiddleware(app: express.Express, name: string, data) {
        app.use((req: express.Request, res: express.Response, next) => {
            req[name] = data
            next()
        })
    }
}
