import * as express from 'express';
import { Route } from '../components/route';

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        Route.getAll()
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
        Route.getById(req.params.id)
            .then(route => {
                if (route)
                    res.status(200).json(route);
                else
                    next();
            })
            .catch(next);
    });
