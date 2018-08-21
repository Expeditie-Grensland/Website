import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as redisConnect from 'connect-redis';
import * as socketio from 'socket.io';
import * as http from 'http';
import * as i18next from 'i18next';
import * as i18nextMiddleware from 'i18next-express-middleware';
import * as FileSystemBackend from 'i18next-node-fs-backend';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as stylus from 'stylus';
import * as passport from 'passport';
import * as ldapauth from 'passport-ldapauth';

import { config } from './helpers/configHelper';
import { Person } from './components/person';
import { Util } from './components/document/util';
import { PersonDocument } from './components/person/model';

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

        app.use(bodyParser.json({ limit: '80MB' })); //TODO change this to something more sensible after importing.
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use(
            stylus.middleware({
                src: path.join(publicDir, 'styles'),
                dest: path.join(publicDir, 'styles-dist'),
                compress: true
            })
        );

        app.use(express.static(publicDir));
    }

    export function setupSession(app: express.Express, io: socketio.Server) {
        const sessionOptions: session.SessionOptions = {
            secret: config.session.secret,
            resave: false,
            saveUninitialized: false
        };

        if (config.session.useRedis) {
            const redisStore = redisConnect(session);
            sessionOptions.store = new redisStore(config.redis);
        }

        const sessionMiddle = session(sessionOptions);

        io.use((socket, next) => sessionMiddle(socket.request, socket.request.res, next));
        app.use(sessionMiddle);
    }

    export function addAuthMiddleware(app: express.Express) {
        passport.use(new ldapauth({
            server: config.ldap
        }, (user, done) => {
            Person.getPersonByLdapId(user.ipaUniqueID)
                .then((p) => {
                    done(null, p);
                });
        }));

        passport.serializeUser((user: PersonDocument, done) => {
            done(null, Util.getObjectID(user))
        });
        passport.deserializeUser((userId: string, done) => {
            Person.getPersonById(userId).then((p) => done(null, p));
        });

        app.use(passport.initialize());
        app.use(passport.session());
    }

    export function setupDatabase(app: express.Express, dev: boolean) {
        mongoose.set('debug', dev);

        (<any>mongoose).Promise = Promise;
        mongoose.connect(
            config.mongo.url,
            {
                user: config.mongo.user,
                pass: config.mongo.pass,
                useNewUrlParser: true
            }
        );
        const db = mongoose.connection;

        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', () => {
            console.info('Connected to models');
        });

        addAsMiddleware(app, 'db', db);
    }

    function addAsMiddleware(app: express.Express, name: string, data) {
        app.use((req, res, next) => {
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
