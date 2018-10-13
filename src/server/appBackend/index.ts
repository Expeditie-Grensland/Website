import * as express from 'express';
import * as passport from 'passport';

import { AuthHelper } from '../helpers/authHelper';
import { People } from '../components/people';
import { PersonDocument } from '../components/people/model';
import { Expedities } from '../components/expedities';

export const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({});
});

router.post('/authenticate', (req, res, next) => {
    passport.authenticate('ldapauth', { session: false }, (err: Error | null, user: PersonDocument | null, info: Error | null) => {
        if (err)
            next(err);
        else if (!user)
            next(info);
        else
            AuthHelper.generateJwt(user, (err2, token) => {
                if (err2)
                    next(err2);
                else
                    res.status(200).json({ token, name: user.name });
            });
    })(req, res, next);
});

router.use((req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] == 'Bearer')
        AuthHelper.parseJwt(req.headers.authorization.split(' ')[1], (err, decoded: string | { id?: string }) => {
            if (err)
                next(err);
            else {
                if (typeof decoded === 'string' || decoded.id == undefined)
                    return next(new Error('Unexpected jwt format'));
                People.getById(decoded.id)
                    .then(person => {
                        req.user = person;
                        next();
                    })
                    .catch(next);
            }
        });
    else
        next(new Error('Token header not present'));
});

router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(401).json({ message: err.message });
});

router.get('/expedities', (req, res) =>
    Expedities.getUnfinishedByParticipant(req.user, { name: 1, nameShort: 1, sequenceNumber: 1 })
        .then(x => res.status(200).json(x)));

// TODO: router.use other files

router.use((req, res) =>
    res.status(404).json({ message: 'Not found' }));

router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({ message: err.message });
});

