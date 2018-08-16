import * as express from 'express';
import { Word } from '../database/word';

export const router = express.Router();

router.get('/', async (req, res) => {
    res.render('dictionary', { dictionary: Word.addLinksToWords(await Word.getWords()) });
});
