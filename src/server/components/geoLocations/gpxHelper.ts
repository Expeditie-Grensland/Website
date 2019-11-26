// @ts-ignore
// TODO: Consider switching library (gpx-parse is old and not much-used and doesn't have typings).
//       Or removing this functionality altogether.
import * as gpxparse from 'gpx-parse';
import * as R from 'ramda';

import { PersonOrId } from '../people/model';
import { GeoLocation } from './model';
import { ExpeditieOrId } from '../expedities/model';
import { Documents } from '../documents';

export namespace GpxHelper {
    export const generateLocations = (gpx: any, expeditie: ExpeditieOrId, person: PersonOrId, timezone: string = 'Europe/Amsterdam'): Promise<GeoLocation[]> => {
        return new Promise((resolve, reject) =>
            gpxparse.parseGpx(gpx, (error: any, data: any) => {
                if (error) return reject(error);

                const [expeditieId, personId] = Documents.getObjectIds([expeditie, person]);

                // @ts-ignore
                return R.pipe(R.prop('tracks'), R.pluck('segments'), R.flatten, R.map((waypoint: any) => <GeoLocation>{
                    expeditieId,
                    personId,
                    time: Date.parse(waypoint.time),
                    timezone,
                    latitude: waypoint.lat,
                    longitude: waypoint.lon,
                    altitude: waypoint.elevation
                }), resolve)(data);
            })
        );
    };
}
