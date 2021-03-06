import * as express from 'express';
import { People } from '../components/people';
import { MediaFiles } from '../components/mediaFiles';

export const router = express.Router({ mergeParams: true });

router.use(async (req, res, next) => {
    const person = await People.getByUserName(req.params.person);

    if (person != null) {
        res.locals.person = person;
        next();
    } else {
        next('router');
    }
});

router.get('/', async (req, res, next) => {
    res.render('public/person');
});
