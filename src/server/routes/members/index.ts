import * as express from 'express';
import * as passport from 'passport';
import {AuthHelper} from "../../helpers/authHelper"

export const router = express.Router();

router.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.session && req.session.returnTo) {
            res.redirect(req.session.returnTo);
            delete req.session.returnTo;
            return;
        }

        res.redirect('/members');
    } else {
        next();
    }
}, (req, res) => {
    res.render('members/login', { messages: req.flash('error') });
});

router.post('/login', passport.authenticate('ldapauth', {
    successReturnToOrRedirect: '/members',
    failureRedirect: '/members/login',
    failureFlash: true
}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.use(AuthHelper.loginRedirect);

router.get('/', (req, res) => {
    res.render('members/index', {
        user: req.user
    });
});
