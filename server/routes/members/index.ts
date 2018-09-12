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
    res.render('members/login');
});

router.post('/login', passport.authenticate('ldapauth', {
    successRedirect: '/members',
    failureRedirect: '/members/login'
}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.use((req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    else res.redirect('/login');
});

router.get('/', (req, res) => {
    res.render('members/index', {
        user: req.user
    });
});
