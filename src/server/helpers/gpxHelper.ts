// @ts-ignore
// TODO: Consider switching library (gpx-parse is old and not much-used and doesn't have typings).
//       Or removing this functionality altogether.
import * as gpxparse from 'gpx-parse';

import { PersonOrID } from '../components/people/model';
import { Location } from '../components/locations/model';
import { Util } from '../components/documents/util';

export namespace GpxHelper {
    export function generateLocations(gpx: any, person: PersonOrID): Promise<Location[]> {
        return new Promise(resolve =>
            gpxparse.parseGpx(gpx, (error: any, data: any) => {
                if (error) return console.error(error);

                const personId = Util.getObjectID(person);
                const track = data.tracks[0];

                console.info('Track length: ' + track.length());

                const locations: Location[] = [];

                for (let seg of track.segments) {
                    for (let waypoint of seg) {
                        locations.push({
                            person: personId,
                            timestamp: Date.parse(waypoint.time).valueOf(),
                            timezone: 'Europe/Amsterdam',
                            lat: waypoint.lat,
                            lon: waypoint.lon,
                            altitude: waypoint.elevation
                        });
                    }
                }

                resolve(locations);
            })
        );
    }
}
