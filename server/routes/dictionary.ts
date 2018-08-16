import * as express from 'express';
import { Word } from '../components/word';

export const router = express.Router();

router.get('/', async (req, res) => {
    res.render('dictionary', { dictionary: Word.addLinksToWords(await Word.getWords()) });
});
