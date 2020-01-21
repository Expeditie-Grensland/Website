import * as express from 'express';
import * as passport from 'passport';
import * as marked from 'marked';

import { AuthHelper } from '../helpers/authHelper';
import { MemberLinks } from '../components/memberLinks';
import { Words } from '../components/words';
import { MediaFiles } from '../components/mediaFiles';
import { Quotes } from '../components/quotes';
import * as R from 'ramda';
import { EarnedPointDocument } from '../components/earnedPoints/model';
import { PersonDocument } from '../components/people/model';
import { ExpeditieDocument } from '../components/expedities/model';
import { EarnedPoints } from '../components/earnedPoints';

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
    res.render('members/login', { isLogin: true, messages: req.flash('error') });
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
    isHome: true,
    links: [
        { title: 'Hoofdpagina', text: 'Alle Expedities (en verborgen videos)', href: '/' },
        {
            title: 'Woordenboek',
            text: 'Het Grote Woordenboek der Expediets',
            href: '/leden/woordenboek',
            adminHref: '/admin/woordenboek'
        },
        {
            title: 'Citaten',
            text: 'De Lange Citatenlijst der Expeditie Grensland',
            href: '/leden/citaten',
            adminHref: '/admin/citaten'
        },
        {
            title: 'De Punt\'n',
            text: 'Welk team is het vurigst? Blauw, of Rood?',
            href: '/leden/punten',
            adminHref: '/admin/punten'
        },
        {
            title: 'Bestanden',
            text: 'Laad ze op, of laad ze neer',
            adminHref: '/admin/bestanden'
        },
        {
            title: 'GPX Upload',
            text: 'Omdat we nog steeds geen app hebben',
            adminHref: '/admin/gpx'
        }
    ].concat((await MemberLinks.getAll()).map((l) => {
        return { title: l.title, text: l.text || '', href: l.href, target: '_blank' };
    }))
}));

const renderer = new marked.Renderer();

const generateSimple = (word: string): string =>
    word
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^0-9a-z]+/gi, '-');

renderer.link = (href, title, text): string => {
    if (href == 'w') {
        href = `#${generateSimple(text)}`;
    } else if (href.slice(0, 2) == 'w:') {
        href = `#${generateSimple(href.slice(2))}`;
    }
    return (new marked.Renderer()).link(href, title, text);
};

renderer.paragraph = (text): string => text;

router.get('/woordenboek', async (req, res) => {
    res.render('members/dictionary', {
        dictionary: await Words.getAll(),
        getFileUrl: MediaFiles.getUrl,
        generateSimple,
        marked: (s: string) => marked(s, { renderer })
    });
});

router.get('/citaten', async (req, res) => {
    res.render('members/quotes', {
        quotes: await Quotes.getAll(),
        getFileUrl: MediaFiles.getUrl,
        generateSimple,
        marked: (s: string) => marked(s, { renderer })
    });
});

router.get('/punten', async (req, res) => {
    const earnedPoints = R.pipe(
        R.map((x: EarnedPointDocument) => {
            return {
                date: x.dateTime.object.toLocaleString({ month: '2-digit', day: '2-digit' }),
                amount: x.amount,
                name: `${(<PersonDocument>x.personId).firstName} ${(<PersonDocument>x.personId).lastName}` ,
                team: (<PersonDocument>x.personId).team,
                expeditie: x.expeditieId ? `Expeditie ${(<ExpeditieDocument>x.expeditieId).name}` : ''
            };
        }),
        // @ts-ignore
        R.groupWith(R.eqProps('expeditie'))
    )(await EarnedPoints.getAllPopulated());

    const score = R.pipe(
        // @ts-ignore
        R.flatten,
        // @ts-ignore
        R.groupBy(R.prop('team')),
        R.map(R.pipe(
            // @ts-ignore
            R.map(R.prop('amount')),
            R.sum
        ))
    )(earnedPoints);

    res.render('members/points', { earnedPoints, score });
});
