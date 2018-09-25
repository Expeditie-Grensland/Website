import * as express from 'express';
import { Routes } from '../components/routes';

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        Routes.getAll()
            .then(routes => {
                if (routes)
                    res.status(200).json(routes);
                else
                    next();
            })
            .catch(next);
    });

router.route('/:id([a-f\\d]{24})')
    .get((req, res, next) => {
        Routes.getById(req.params.id)
            .then(route => {
                if (route)
                    res.status(200).json(route);
                else
                    next();
            })
            .catch(next);
    });
