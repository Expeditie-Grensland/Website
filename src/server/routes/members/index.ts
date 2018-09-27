import * as express from 'express';
import * as passport from 'passport';

export const router = express.Router();

router.get('/login', (req, res, next) => {
    if (req.isAuthenticated()) {
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

router.use((req, res, next) => {
    if (req.isAuthenticated())
        next();
    else {
        if (req.session)
            req.session.returnTo = req.originalUrl;
        res.redirect('/members/login');
    }
});

router.get('/', (req, res) => {
    res.render('members/index', {
        user: req.user
    });
});
