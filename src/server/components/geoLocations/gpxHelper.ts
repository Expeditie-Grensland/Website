// @ts-ignore
// TODO: Consider switching library (gpx-parse is old and not much-used and doesn't have typings).
//       Or removing this functionality altogether.
import * as gpxparse from 'gpx-parse';
import * as R from 'ramda';

import { PersonOrID } from '../people/model';
import { Util } from '../documents/util';
import { GeoLocation } from './model';
import { ExpeditieOrID } from '../expedities/model';

export namespace GpxHelper {
    export const generateLocations = (gpx: any, expeditie: ExpeditieOrID, person: PersonOrID, timezone: string = 'Europe/Amsterdam'): Promise<GeoLocation[]> => {
        return new Promise((resolve, reject) =>
            gpxparse.parseGpx(gpx, (error: any, data: any) => {
                if (error) return reject(error);

                const [expeditieId, personId] = Util.getRealObjectIDs([expeditie, person]);

                // @ts-ignore
                R.pipe(R.prop('tracks'), R.pluck('segments'), R.flatten, R.map((waypoint: any) => <GeoLocation>{
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
