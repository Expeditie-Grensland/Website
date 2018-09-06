import * as express from 'express';

import { router as debugRouter } from './debug';
import { router as expeditieRouter } from './expeditie';
import { router as homeRouter } from './home';
import { router as apiRouter } from './api';
import { router as dictionaryRouter } from './dictionary';
import { router as loginRouter } from './login';
import { router as membersRouter } from './members';

export function Router(dev: boolean): express.Router {
    const router = express.Router();

    router.use('/api', apiRouter);
    router.use('/dictionary', dictionaryRouter);
    router.use('/woordenboek', dictionaryRouter);
    router.use('/login', loginRouter);
    router.use('/members', membersRouter);

    if (dev) router.use('/debug', debugRouter);

    router.use('/', homeRouter);
    router.use('/:expeditie', expeditieRouter);

    return router;
}
