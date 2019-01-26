import * as express from 'express';
import * as passport from 'passport';
import { AuthHelper } from '../../helpers/authHelper';

import { router as dictionaryRouter } from './dictionary';
import { router as quotesRouter } from './quotes';

export const router = express.Router();

router.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.session && req.session.returnTo) {
            res.redirect(req.session.returnTo);
            delete req.session.returnTo;
            return;
        }

        res.redirect('/leden');
    } else {
        next();
    }
}, (req, res) => {
    res.render('members/login', { messages: req.flash('error') });
});

router.post('/login', passport.authenticate('ldapauth', {
    successReturnToOrRedirect: '/leden',
    failureRedirect: '/leden/login',
    failureFlash: true
}));

router.get('/loguit', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.use(AuthHelper.loginRedirect);

router.get('/', (req, res) => res.render('members/index'));

router.use('/woordenboek', dictionaryRouter);
router.use('/citaten', quotesRouter);
