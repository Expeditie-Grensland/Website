import * as express from 'express';
import { Person } from '../components/person';

export const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        Person.getAll()
            .then(persons => {
                if (persons)
                    res.status(200).json(persons);
                else
                    next();
            })
            .catch(next);
    });

router.route('/me')
    .get((req, res) =>
        res.status(200).json(req.user));

router.route('/:id([a-f\\d]{24})')
    .get((req, res, next) => {
        Person.getById(req.params.id)
            .then(person => {
                if (person)
                    res.status(200).json(person);
                else
                    next();
            })
            .catch(next);
    });
