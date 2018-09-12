import * as express from 'express';
import * as passport from 'passport';

import { AuthHelper } from '../helpers/authHelper';
import { Person } from '../components/person';
import { router as expeditiesRouter } from './expedities';
import { router as personsRouter } from './persons';
import { router as routesRouter } from './routes';
import { router as wordsRouter } from './words';

export const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({});
});

router.post('/authenticate', (req, res, next) => {
    passport.authenticate('ldapauth', { session: false }, (err, user, info) => {
        if (err)
            next(err);
        else if (!user)
            next([401, info]);
        else
            AuthHelper.generateJWT(user, (err2, token) => {
                if (err2)
                    next(err2);                else

                    res.status(200).json({ token });
            });
    })(req, res, next);
});

router.use((req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] == 'Bearer')
        AuthHelper.parseJWT(req.headers.authorization.split(' ')[1], (err, decoded: { id }) => {
            if (err)
                next([401, err.message]);
            else {
                Person.getPersonById(decoded.id)
                    .then(person => {
                        req.user = person;
                        next();
                    })
                    .catch(err2 => next([401, err2]));
            }
        });
    else
        next([401, 'Token header not present']);
});

router.use('/expedities', expeditiesRouter);
router.use('/persons', personsRouter);
router.use('/routes', routesRouter);
router.use('/words', wordsRouter);

router.use((req, res, next) =>
    res.status(404).json({ message: 'Not found' }));

router.use((err, req, res, next) => {
    let status = 500;

    if (Array.isArray(err))
        [status, err] = err;

    res.status(status).json({ message: err.message });
});

