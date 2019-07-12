import * as express from 'express';

import { router as debugRouter } from './debug';
import { router as expeditieRouter } from './expeditie';
import { router as homeRouter } from './home';
import { router as membersRouter } from './members';
import { router as importRouter } from './importStan';

export function Router(dev: boolean): express.Router {
    const router = express.Router();

    router.use('/leden', membersRouter);

    router.use('/import_stan', importRouter);

    router.get('/login', (req, res) => res.redirect(301, '/leden/login'));
    router.get('/woordenboek', (req, res) => res.redirect(301, '/leden/woordenboek'));
    router.get('/citaten', (req, res) => res.redirect(301, '/leden/citaten'));

    if (dev) router.use('/debug', debugRouter);

    router.use('/', homeRouter);
    router.use('/:expeditie', expeditieRouter);

    return router;
}
