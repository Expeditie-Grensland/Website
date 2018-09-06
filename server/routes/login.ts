import * as express from 'express';
import * as passport from 'passport';

export const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/members');
    } else {
        next();
    }
}, (req, res) => {
    res.render('login');
});

router.post('/', passport.authenticate('ldapauth', {
    successRedirect: '/members',
    failureRedirect: '/login'
}));
