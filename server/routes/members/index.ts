import * as express from 'express';
import * as passport from 'passport';

export const router = express.Router();

router.get('/login', (req, res) => {
    res.render('members/login');
});

router.post('/login', passport.authenticate('ldapauth'), (req, res) => {
    res.send(req.user);
});
