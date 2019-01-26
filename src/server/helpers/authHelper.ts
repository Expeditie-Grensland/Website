import * as jwt from 'jsonwebtoken';
import * as express from 'express';

import { config } from './configHelper';
import { PersonOrID } from '../components/people/model';
import { Util } from '../components/documents/util';

export namespace AuthHelper {
    export const generateJwt = (person: PersonOrID, callback: jwt.SignCallback): void => {
        jwt.sign(
            {
                id: Util.getObjectID(person)
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
        )
    };

    export const loginRedirect = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.isAuthenticated()) {
            res.locals.user = req.user;
            next();
        }
        else {
            if (req.session)
                req.session.returnTo = req.originalUrl;

            res.redirect('/leden/login');
        }
    }
}
