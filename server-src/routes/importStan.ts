import * as express from 'express';
import * as bodyParser from 'body-parser'
import { Expeditie } from '../database/expeditie';
import { Location } from '../database/location';
import { Person } from '../database/person';

export const router = express.Router();

router.get('/', (req, res) => {
    res.render('importStan');
})

router.use('/data', bodyParser.text({type: 'application/gpx', limit: '80MB'}));
router.post('/data', async (req, res) => {
    const maurice = await Person.getPerson("Maurice Meedendorp");
    const stan = Expeditie.getExpeditieByNameShort('stan');

    const data: any = req.body;

    stan.catch(err => {
        res.send("Stan not found. Error: " + err)
    });

    const locations = await Location.fromGPX(data, maurice);

    stan.then(Expeditie.addLocations(locations))
        .then(() => res.send('File received'));
});
