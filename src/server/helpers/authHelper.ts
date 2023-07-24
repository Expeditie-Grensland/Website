import jwt from 'jsonwebtoken';
import express from 'express';

import { config } from './configHelper.js';
import { PersonDocument, PersonOrId } from '../components/people/model.js';
import * as Documents from '../components/documents/index.js';

export const generateJwt = (person: PersonOrId, callback: jwt.SignCallback): void => {
    jwt.sign(
        {
            id: Documents.getStringId(person)
        },
        config.session.secret,
        {
            algorithm: 'HS256'
        },
        callback);
};

export const parseJwt = (token: string, callback: jwt.VerifyCallback): void => {
    jwt.verify(
        token,
        config.session.secret,
        callback
    );
};

export const setAuthLocals = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
        res.locals.loggedIn = req.isAuthenticated();
        res.locals.user = req.user;
    }
    next();
};

export const loginRedirect = (req: express.Request & {session: any}, res: express.Response, next: express.NextFunction) => {
    if (!req.isAuthenticated()) {
        if (req.session && req.method == 'GET')
            req.session.returnTo = req.originalUrl;

        res.redirect('/leden/login');
    } else next();
};

export const noAdminRedirect = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!(req.user as PersonDocument).isAdmin) {
        res.redirect('/leden');
    } else next();
};
