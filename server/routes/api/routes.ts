import * as express from 'express';
import { Route } from '../../components/route';

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        Route.getRoutes()
            .then(routes => {
                if (routes)
                    res.status(200).json({ status: 200, routes });
                else
                    next();
            })
            .catch(next);
    });

router.route('/:id([a-f\\d]{24})')
    .get((req, res, next) => {
        Route.getRouteById(req.params.id)
            .then(route => {
                if (route)
                    res.status(200).json({ status: 200, route });
                else
                    next();
            })
            .catch(next);
    });
