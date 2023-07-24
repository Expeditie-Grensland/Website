// @ts-ignore
// TODO: Consider switching library (gpx-parse is old and not much-used and doesn't have typings).
//       Or removing this functionality altogether.
import gpxparse from 'gpx-parse';

import { PersonOrId } from '../people/model.js';
import { GeoLocation } from './model.js';
import { ExpeditieOrId } from '../expedities/model.js';
import * as Documents from '../documents/index.js';

export const generateLocations = (gpx: any, expeditie: ExpeditieOrId, person: PersonOrId, timezone = 'Europe/Amsterdam'): Promise<GeoLocation[]> => {
    return new Promise((resolve, reject) =>
        gpxparse.parseGpx(gpx, (error: any, data: any) => {
            if (error) return reject(error);

            const [expeditieId, personId] = Documents.getObjectIds([expeditie, person]);

            return resolve(data.tracks.map((track: any) => track.segments).flat(2).map((wpt: any) => ({
                expeditieId,
                personId,
                dateTime: {
                    stamp: Date.parse(wpt.time) / 1000,
                    zone: timezone
                },
                latitude: wpt.lat,
                longitude: wpt.lon,
                altitude: wpt.elevation
            }) as GeoLocation));
        })
    );
};
