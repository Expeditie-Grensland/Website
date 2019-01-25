import * as express from 'express';

import { router as debugRouter } from './debug';
import { router as expeditieRouter } from './expeditie';
import { router as homeRouter } from './home';
import { router as dictionaryRouter } from './dictionary';
import { router as quotesRouter } from './quotes';
import { router as membersRouter } from './members';

export function Router(dev: boolean): express.Router {
    const router = express.Router();
    router.use('/dictionary', dictionaryRouter);
    router.use('/woordenboek', dictionaryRouter);
    router.use('/quotes', quotesRouter);
    router.use('/citaten', quotesRouter);
    router.use('/members', membersRouter);
    router.get('/login', (req, res) => res.redirect(301, '/members/login'));

    if (dev) router.use('/debug', debugRouter);

    router.use('/', homeRouter);
    router.use('/:expeditie', expeditieRouter);

    return router;
}
