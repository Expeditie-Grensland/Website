import * as express from 'express';
import { Word } from '../../components/word';

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        Word.getWords()
            .then(words => {
                if (words)
                    res.status(200).json({ status: 200, words });
                else
                    next();
            })
            .catch(next);
    });

router.route('/:id([a-f\\d]{24})')
    .get((req, res, next) => {
        Word.getWordById(req.params.id)
            .then(word => {
                if (word)
                    res.status(200).json({ status: 200, word });
                else
                    next();
            })
            .catch(next);
    });
