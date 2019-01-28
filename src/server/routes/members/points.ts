import * as express from 'express';

export const router = express.Router();

router.get('/', async (req, res) => {
    res.render('members/points');
});
