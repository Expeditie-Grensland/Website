import * as express from 'express';
import { addLocations } from '../helpers/stanLocations';

export const router = express.Router();

router.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

router.post('/stan_locations', async (req, res) => {
    let locations = req.body['locations'];
    if (!locations) {
        res.json({ status: 'err' });
        return;
    }
    let ids = await addLocations(locations);
    res.json({ status: 'ok', ids: ids });
});
