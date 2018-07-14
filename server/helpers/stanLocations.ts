import { Expeditie } from '../database/expeditie';
import { TableData } from '../database/tables';

export async function addLocations(locations: any): Promise<number[]> {
    const stan = Expeditie.getExpeditieByNameShort('stan');

    let ids = [];
    let locs: TableData.Location.Location[] = [];
    locations.forEach(async location => {
        let l = createLocation(location);
        if (l != undefined) {
            ids.push(location['id']);
            locs.push(l);
        }
    });
    console.log(locs);
    stan.then(Expeditie.addLocations(locs));
    return ids;
}

function createLocation(location: any): TableData.Location.Location {
    let rObject = {
        person: '5afb39ba6c878654c67c0a16',
        timestamp: undefined,
        timezone: undefined,
        lat: undefined,
        lon: undefined,
        altitude: undefined,
        horizontalAccuracy: undefined,
        verticalAccuracy: undefined,
        bearing: undefined,
        bearingAccuracy: undefined,
        speed: undefined,
        speedAccuracy: undefined
    };

    let essValues = [
        'timestamp',
        'timezone',
        'lat',
        'lon',
        'altitude',
        'horizontalAccuracy',
        'verticalAccuracy',
        'bearing',
        'bearingAccuracy',
        'speed',
        'speedAccuracy'
    ];

    for (let i = 0; i < essValues.length; i++) {
        let value = essValues[i];
        if (location[value] == undefined) {
            return undefined;
        }
        rObject[value] = location[value];
    }
    console.log(rObject);
    return rObject;
}
