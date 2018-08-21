import * as express from 'express';

export const router = express.Router();

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
    res.send(req.user.name + " is authenticated");
});
