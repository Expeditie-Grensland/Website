import * as express from 'express';

import { Expedities } from '../components/expedities';
import { People } from '../components/people';
import { GpxHelper } from '../components/geoLocations/gpxHelper';
import { GeoLocations } from '../components/geoLocations';
import bodyParser = require('body-parser');

export const router = express.Router({ mergeParams: true });

router.get('/', (req, res) =>
    res.render('importStan')
);

router.use('/data', bodyParser.text({ type: 'application/gpx', limit: '80MB' }));

router.post('/data', async (req, res) => {

    const martijn = await People.getByName('Martijn Atema');

    const expeditie = await Expedities.getByNameShort('stan2');

    if (expeditie == null)
        res.send('Expeditie not found.');
    if (martijn == null)
        res.send('Martijn not found.');

    const data: any = req.body;

    const locations = await GpxHelper.generateLocations(data, expeditie!, martijn!);

    await GeoLocations.createMany(locations);

    res.send('File recieved');
});
