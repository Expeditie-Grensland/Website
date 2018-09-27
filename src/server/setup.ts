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
import * as passport from 'passport';
import * as ldapauth from 'passport-ldapauth';

import { config } from './helpers/configHelper';
import { People } from './components/people';
import { Util } from './components/documents/util';
import { PersonDocument } from './components/people/model';
import { router as apiRouter } from './api';
import { MediaFileHelper } from './components/mediaFiles';
import flash = require('connect-flash');

export namespace Setup {
    export function startServer(server: http.Server, port: number) {
        server.listen(port);
    }

    export function setupExpress(app: express.Express, root: string, dev: boolean) {
        const viewsDir = path.join(root, 'views');
        const publicDir = path.join(root, 'public');

        app.set('view engine', 'pug');
        app.set('views', viewsDir);

        app.use(bodyParser.json({ limit: '80MB' })); //TODO change this to something more sensible after importing.
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use('/api', apiRouter);

        if (dev) {
            app.use('/media', express.static(MediaFileHelper.getFilesFolder(), { fallthrough: false }));
            app.use('/static', express.static(publicDir, { fallthrough: false }));
        }

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
    }

    export function setupSession(app: express.Express, io: socketio.Server) {
        const sessionOptions: session.SessionOptions = {
            secret: config.session.secret,
            resave: false,
            saveUninitialized: false
        };

        if (config.session.useRedis)
            sessionOptions.store = new (redisConnect(session))(config.redis);

        const sessionMiddle = session(sessionOptions);
        io.use((socket, next) => sessionMiddle(socket.request, socket.request.res, next));
        app.use(sessionMiddle);

        app.use(flash());
    }

    export function addAuthMiddleware(app: express.Express) {
        passport.use(new ldapauth({ server: config.ldap }, (user, done) =>
            People.getByLdapId(user.ipaUniqueID)
                .then(p => done(null, p))));

        passport.serializeUser((user: PersonDocument, done) =>
            done(null, Util.getObjectID(user)));

        passport.deserializeUser((userId: string, done) =>
            People.getById(userId)
                .then(p => done(null, p))
                .catch(e => done(e, null)));

        app.use(passport.initialize());
        app.use(passport.session());
    }

    export function setupDatabase(app: express.Express, dev: boolean) {
        mongoose.set('debug', dev);

        mongoose.connect(
            config.mongo.url,
            {
                user: config.mongo.user,
                pass: config.mongo.pass,
                useNewUrlParser: true
            }
        );

        mongoose.connection
            .on('error', console.error.bind(console, 'connection error:'))
            .once('open', () => console.info('Connected to models'));
    }
}