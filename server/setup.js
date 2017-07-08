"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const stylus = require("stylus");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const redis = require("redis");
const redisConnect = require("connect-redis");
const config_1 = require("./config");
const routes_1 = require("./routes/routes");
const tables_1 = require("./database/tables");
const authGoogle = require('passport-google-oauth2');
const useRedis = config_1.Config.session.redis;
const redisStore = useRedis ? redisConnect(session) : null;
const redisClient = useRedis ? redis.createClient() : null;
var Setup;
(function (Setup) {
    function startServer(server) {
        server.listen(3000);
    }
    Setup.startServer = startServer;
    function setupExpress(app, root) {
        const viewsDir = path.join(root, 'views');
        const publicDir = path.join(root, 'public');
        app.set('view engine', 'pug');
        app.set('views', viewsDir);
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(stylus.middleware(publicDir));
        app.use(express.static(publicDir));
    }
    Setup.setupExpress = setupExpress;
    function setupSession(app, io) {
        const sessionData = {
            resave: false,
            saveUninitialized: false,
            secret: config_1.Config.session.secret
        };
        if (useRedis) {
            sessionData['store'] = new redisStore({
                host: 'localhost',
                port: config_1.Config.redis.port,
                client: redisClient,
                ttl: config_1.Config.redis.ttl
            });
        }
        const sessionMiddle = session(sessionData);
        io.use((socket, next) => sessionMiddle(socket.request, socket.request.res, next));
        app.use(sessionMiddle);
    }
    Setup.setupSession = setupSession;
    function setupDatabase(address, port, database, user, password) {
        mongoose.connect("mongodb://" + address + ":" + port + "/" + database, { user: user, pass: password });
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function (callback) {
            console.log("Connected to database");
        });
        tables_1.Tables.initTables();
        return db;
    }
    Setup.setupDatabase = setupDatabase;
    function setupAuthGoogle(googleID, googleSecret) {
        const googleLogin = {
            clientID: googleID,
            clientSecret: googleSecret,
            callbackURL: config_1.Config.auth.callback + routes_1.Routes.user.AUTH_CALLBACK,
            passReqToCallback: true
        };
        const handleLogin = (request, accessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
                done(null, null); // return db user in second or error in first
            });
        };
        passport.serializeUser((user, done) => done(null, user)); // user to userID
        passport.deserializeUser((user, done) => done(null, user)); // user from userID
        passport.use(new authGoogle.Strategy(googleLogin, handleLogin));
    }
    Setup.setupAuthGoogle = setupAuthGoogle;
    function addAuthMiddleware(app) {
        app.use(passport.initialize());
        app.use(passport.session());
    }
    Setup.addAuthMiddleware = addAuthMiddleware;
    function addAsMiddleware(app, name, data) {
        app.use((req, res, next) => {
            req[name] = data;
            next();
        });
    }
    Setup.addAsMiddleware = addAsMiddleware;
})(Setup = exports.Setup || (exports.Setup = {}));
