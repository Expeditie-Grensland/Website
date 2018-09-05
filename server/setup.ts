import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as i18next from 'i18next';
import * as i18nextMiddleware from 'i18next-express-middleware';
import * as FileSystemBackend from 'i18next-node-fs-backend';
import * as mongoose from 'mongoose';
import * as path from 'path';

import { ConfigHelper } from './helpers/configHelper';

export namespace Setup {
    export function startServer(server: http.Server, port: number) {
        server.listen(port);
    }

    export function setupExpress(app: express.Express, root: string) {
        const viewsDir = path.join(root, 'views');
        const publicDir = path.join(root, 'public');

        app.set('view engine', 'pug');
        app.set('views', viewsDir);

        i18next
            .use(FileSystemBackend)
            .use(i18nextMiddleware.LanguageDetector)
            .init({
                preload: ['en', 'nl'],
                lowerCaseLng: true,
                fallbackLng: 'en',
                saveMissing: true,
                backend: {
                    loadPath: path.join(root, 'locales/{{lng}}/{{ns}}.json'),
                    addPath: path.join(root, 'locales/{{lng}}/{{ns}}.missing.json'),
                    jsonIndent: 2
                }
            });
        app.use(i18nextMiddleware.handle(i18next));

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json({ limit: '80MB' })); //TODO change this to something more sensible after importing.

        app.use(express.static(publicDir));
    }

    export function setupDatabase(app: express.Express, mConfig: ConfigHelper.MongoConfig, dev: boolean) {
        mongoose.set('debug', dev);

        (<any>mongoose).Promise = Promise;
        mongoose.connect(
            mConfig.url,
            {
                user: mConfig.user,
                pass: mConfig.pass,
                useNewUrlParser: true
            }
        );
        const db = mongoose.connection;

        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function() {
            console.info('Connected to models');
        });

        addAsMiddleware(app, 'db', db);
    }

    function addAsMiddleware(app: express.Express, name: string, data) {
        app.use((req: express.Request, res: express.Response, next) => {
            req[name] = data;
            next();
        });
    }
}


// TODO: Came from routes/debug (only load if env == devlopment)
// process.on('unhandledRejection', (reason, p) => {
//     console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
//     // application specific logging, throwing an error, or other logic here
// });
