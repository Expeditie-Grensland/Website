import bodyParser from "body-parser";
import RedisStore from "connect-redis";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import http from "node:http";
import path from "node:path";
import passport from "passport";
import ldapauth from "passport-ldapauth";
import redis from "redis";

import flash from "connect-flash";
import { getPersonById, getPersonByLdapId } from "./components/people/index.js";
import { config } from "./helpers/configHelper.js";
import { fileUrlMiddleware } from "./helpers/files.js";

export function startServer(server: http.Server, port: string) {
  server.listen(port);
  console.info(`Server started on port: ${port}`);
}

export function setupExpress(app: express.Express, root: string, dev: boolean) {
  const viewsDir = path.join(root, "views");
  const staticDir = path.join(root, "static");

  app.set("view engine", "pug");
  app.set("views", viewsDir);

  app.use(bodyParser.json({ limit: "80MB" })); //TODO change this to something more sensible after importing.
  app.use(bodyParser.urlencoded({ extended: true }));

  if (dev) {
    app.use("/static", express.static(staticDir, { fallthrough: false }));

    Object.entries({
      "favicon.ico": "favicons/favicon.ico",
      "browserconfig.xml": "favicons/browserconfig.xml",
      "manifest.webmanifest": "favicons/manifest.webmanifest",
      "worker.js": "scripts/worker.js",
    }).forEach(([name, location]) => {
      app.get(`/${name}`, (req, res) =>
        res.sendFile(path.join(staticDir, location))
      );
    });
  }
}

export function setupSession(app: express.Express) {
  const sessionOptions: session.SessionOptions = {
    secret: config.session.secret,
    cookie: {
      secure: app.get("env") === "production",
    },
    proxy: app.get("env") === "production",
    resave: false,
    saveUninitialized: false,
  };

  if (config.redis.url) {
    const redisClient = redis.createClient({
      url: config.redis.url,
    });
    redisClient.connect().catch(console.error);

    sessionOptions.store = new RedisStore({
      client: redisClient,
      prefix: config.redis.prefix,
      ttl: 2592000,
    });
  }

  app.use(session(sessionOptions));

  app.use(flash());

  app.use(fileUrlMiddleware);
}

export function addAuthMiddleware(app: express.Express) {
  passport.use(
    new ldapauth(
      {
        server: {
          url: config.ldap.url,
          bindDN: config.ldap.bindDN,
          bindCredentials: config.ldap.bindCredentials,
          searchBase: config.ldap.searchBase,
          searchFilter: config.ldap.searchFilter,
          searchScope: config.ldap.searchScope,
          searchAttributes: [config.ldap.idField],
        },
      },
      (user: any, done: ldapauth.VerifyDoneCallback) =>
        user && user[config.ldap.idField]
          ? getPersonByLdapId(user[config.ldap.idField]).then((p) =>
              p ? done(null, p) : done(null, false)
            )
          : done(new Error("LDAP user is unexpectedly null"))
    )
  );

  passport.serializeUser((user: any, done) => done(null, user._id));

  passport.deserializeUser((userId: mongoose.Types.ObjectId, done) =>
    getPersonById(userId)
      .then((p) => done(null, p || false))
      .catch(done)
  );

  app.use(passport.initialize());
  app.use(passport.session());
}

export function setupDatabase(dev: boolean) {
  mongoose.set("debug", dev);

  mongoose.connect(config.mongo.url);

  mongoose.connection
    .on("error", console.error.bind(console, "connection error:"))
    .once("open", () => console.info("Connected to models"));
}
