import * as express from 'express';

export const router = express.Router();

router.get('/uptime', (req, res) => {
    const sprintf = require('sprintf-js').sprintf;

    res.send(sprintf('Uptime: %s.', process.uptime()));
});
