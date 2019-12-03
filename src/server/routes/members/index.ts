import * as express from 'express';
import * as passport from 'passport';
import { AuthHelper } from '../../helpers/authHelper';

import { router as dictionaryRouter } from './dictionary';
import { router as quotesRouter } from './quotes';
import { router as pointsRouter } from './points';
import { MemberLinks } from '../../components/memberLinks';

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

router.get('/', async (req, res) => res.render('members/index', {
    links: [
        { title: 'Hoofdpagina', text: 'Alle Expedities (en verborgen videos)', href: '/' },
        { title: 'Woordenboek', text: 'Het Grote Woordenboek der Expediets', href: '/leden/woordenboek' },
        { title: 'Citaten', text: 'De Lange Citatenlijst der Expeditie Grensland', href: '/leden/citaten' },
        { title: 'De Punt\'n', text: 'Welk team is het vurigst? Blauw, of Rood?', href: '/leden/punten' }
    ].concat((await MemberLinks.getAll()).map((l) => {
        return { title: l.title, text: l.text || '', href: l.href};
    }))
}));

router.use('/woordenboek', dictionaryRouter);
router.use('/citaten', quotesRouter);
router.use('/punten', pointsRouter);
