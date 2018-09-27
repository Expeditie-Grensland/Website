import * as express from 'express';
import * as passport from 'passport';

import { AuthHelper } from '../helpers/authHelper';
import { People } from '../components/people';
import { router as expeditiesRouter } from './expedities';
import { router as mediaFilesRouter } from './mediaFiles';
import { router as personsRouter } from './persons';
import { router as routesRouter } from './routes';
import { router as wordsRouter } from './words';

export const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({});
});

router.post('/authenticate', (req, res, next) => {
    passport.authenticate('ldapauth', { session: false }, (err: any, user: any, info: any) => {
        if (err)
            next(err);
        else if (!user)
            next([401, info]);
        else
            AuthHelper.generateJwt(user, (err2, token) => {
                if (err2)
                    next(err2);
                else
                    res.status(200).json({ token });
            });
    })(req, res, next);
});

router.use((req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] == 'Bearer')
        AuthHelper.parseJwt(req.headers.authorization.split(' ')[1], (err, decoded: any) => {
            if (err)
                next([401, err.message]);
            else {
                if (decoded.id == undefined)
                    return next([401, new Error('Unexpected jwt format')]);
                People.getById(decoded.id)
                    .then(person => {
                        req.user = person;
                        next();
                    })
                    .catch(err2 => next([401, err2]));
            }
        });
    else
        next([401, new Error('Token header not present')]);
});

router.use('/expedities', expeditiesRouter);
router.use('/media-files', mediaFilesRouter);
router.use('/persons', personsRouter);
router.use('/routes', routesRouter);
router.use('/words', wordsRouter);

router.use((req, res) =>
    res.status(404).json({ message: 'Not found' }));

router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
        return next(err);
    }

    let status = 500;

    if (Array.isArray(err))
        [status, err] = err;

    res.status(status).json({ message: err.message });
});

