import * as express from 'express';
import * as passport from 'passport';
import { AuthHelper } from '../helpers/authHelper';
import { Person } from '../components/person';

export const router = express.Router();

router.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

router.post('/authenticate', (req, res, next) => {
    passport.authenticate('ldapauth', { session: false }, (err, user, info) => {
        if (err)
            res.status(500).json({ status: 500, error: err.message });
        else if (!user)
            res.status(401).json({ status: 401, error: info.message });
        else
            AuthHelper.generateJWT(user, (err2, encoded) => {
                if (err2)
                    res.status(500).json({ status: 500, error: err2.message });
                else
                    res.status(200).json({ status: 200, token: encoded });
            });
    })(req, res, next);
});

router.use((req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] == 'Bearer')
        AuthHelper.parseJWT(req.headers.authorization.split(' ')[1], (err, decoded: { id }) => {
            if (err)
                res.status(401).json({ status: 401, error: err.message });
            else {
                Person.getPersonById(decoded.id)
                    .then(person =>
                        req.logIn(person, err2 => {
                                if (err2)
                                    res.status(401).json({ status: 401, error: err2.message });
                                else
                                    next();
                            }
                        )
                    ).catch(err2 => res.status(401).json({ status: 401, error: err2.message })
                );
            }
        });
    else
        res.status(401).json({ status: 401, error: 'Token header not present' });
});
