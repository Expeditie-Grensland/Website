import * as express from 'express';
import { Expeditie } from '../components/expeditie';

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        Expeditie.getExpedities()
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
        Expeditie.getExpeditieById(req.params.id)
            .then(expeditie => {
                if (expeditie)
                    res.status(200).json(expeditie);
                else
                    next();
            })
            .catch(next);
    });
