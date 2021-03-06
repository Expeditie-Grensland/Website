import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as session from 'express-session';
import * as redis from 'redis';
import * as redisConnect from 'connect-redis';
import * as http from 'http';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as passport from 'passport';
import * as ldapauth from 'passport-ldapauth';
import * as fs from 'fs';
import * as net from 'net';

import { config } from './helpers/configHelper';
import { People } from './components/people';
import { PersonDocument } from './components/people/model';
import { router as appBackend } from './appBackend';
import { Documents } from './components/documents';
import flash = require('connect-flash');

export namespace Setup {
    export function startServer(server: http.Server, port: number | string) {
        server.listen(port);

        if (isNaN(parseInt(port as any))) {
            // Server is listening on a socket

            server.on('listening', () => fs.chmodSync(port as string, 0o777));

            server.on('error', (e: any) => {
                if (e.code !== 'EADDRINUSE') throw e;

                net.connect({ path: port as string }, () => {
                    throw e;
                }).on('error', function (e: any) {
                    if (e.code !== 'ECONNREFUSED') throw e;

                    // Socket is not really in use: delete and re-listen
                    fs.unlinkSync(port as string);
                    server.listen(port);
                });
            });
        }
    }

    export function setupExpress(app: express.Express, root: string, dev: boolean) {
        const viewsDir = path.join(root, 'views');
        const staticDir = path.join(root, 'static');

        app.set('view engine', 'pug');
        app.set('views', viewsDir);

        app.use(bodyParser.json({ limit: '80MB' })); //TODO change this to something more sensible after importing.
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use('/app-backend', appBackend);

        if (dev) {
            app.use('/media', (req, res) => res.redirect('https://expeditiegrensland.nl/media/' + req.path));
            app.use('/static', express.static(staticDir, { fallthrough: false }));
            app.get('/favicon.ico', (req, res) => res.sendFile(path.join(staticDir, '/favicons/favicon.ico')));
            app.get('/browserconfig.xml', (req, res) => res.sendFile(path.join(staticDir, '/favicons/browserconfig.xml')));
            app.get('/manifest.webmanifest', (req, res) => res.sendFile(path.join(staticDir, '/favicons/manifest.webmanifest')));
            app.get('/worker.js', (req, res) => res.sendFile(path.join(staticDir, '/scripts/worker.js')));
        }
    }

    export function setupSession(app: express.Express) {
        const sessionOptions: session.SessionOptions = {
            secret: config.session.secret,
            resave: false,
            saveUninitialized: false
        };

        if (config.session.useRedis)
            sessionOptions.store = new (redisConnect(session))({
                client: redis.createClient(config.redis)
            });

        app.use(session(sessionOptions));

        app.use(flash());
    }

    export function addAuthMiddleware(app: express.Express) {
        passport.use(new ldapauth({ server: config.ldap }, (user: any, done: ldapauth.VerifyDoneCallback) =>
            (user && user[config.ldap.idField]) ?
                People.getByLdapId(user[config.ldap.idField]).then(p => p ? done(null, p) : done(null, false))
                : done(new Error('LDAP user is unexpectedly null'))));

        passport.serializeUser((user: PersonDocument, done) =>
            done(null, Documents.getObjectId(user)));

        passport.deserializeUser((userId: mongoose.Types.ObjectId, done) =>
            People.getById(userId)
                .then(p => done(null, p || false))
                .catch(done));

        app.use(passport.initialize());
        app.use(passport.session());
    }

    export function setupDatabase(app: express.Express, dev: boolean) {
        mongoose.set('debug', dev);

        mongoose.set('useCreateIndex', true);
        mongoose.set('useFindAndModify', false);

        mongoose.connect(
            config.mongo.url,
            {
                user: config.mongo.user,
                pass: config.mongo.pass,
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );

        mongoose.connection
            .on('error', console.error.bind(console, 'connection error:'))
            .once('open', () => console.info('Connected to models'));
    }
}
