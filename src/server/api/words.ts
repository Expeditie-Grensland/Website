import * as express from 'express';
import { Words } from '../components/words';

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        Words.getAll()
            .then(words => {
                if (words)
                    res.status(200).json(words);
                else
                    next();
            })
            .catch(next);
    });

router.route('/:id([a-f\\d]{24})')
    .get((req, res, next) => {
        Words.getById(req.params.id)
            .then(word => {
                if (word)
                    res.status(200).json(word);
                else
                    next();
            })
            .catch(next);
    });