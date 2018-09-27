import * as express from 'express';
import { Expedities } from '../components/expedities';

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        Expedities.getAll()
            .then(expedities => {
                if (expedities)
                    res.status(200).json(expedities);
                else
                    next();
            })
            .catch(next);
    });

router.route('/:id([a-f\\d]{24})')
    .get((req, res, next) => {
        Expedities.getById(req.params.id)
            .then(expeditie => {
                if (expeditie)
                    res.status(200).json(expeditie);
                else
                    next();
            })
            .catch(next);
    });
