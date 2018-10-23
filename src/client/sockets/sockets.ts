import Pbf from 'pbf';

import { MapHandler } from '../map/mapHandler';
import { LoadingBar } from '../map/loadingBar';
import { SocketTypes } from './types';
import { DatabaseTypes } from '../database/types';
import { Database } from '../database';

declare var expeditieNameShort: string;

export namespace Sockets {

    const locations: DatabaseTypes.Location[] = [];
    let expeditie: DatabaseTypes.Expeditie;
    let personMap: { [numId: number]: string };

    let totalCount: number;
    let receivedCount: number = 0;

    export function parseInfo(info: SocketTypes.Expeditie) {
        LoadingBar.setLoadingText('Received route info.');
        personMap = info.personMap;

        expeditie = {
            name: expeditieNameShort,
            nodes: info.nodes,
            box: info.box,
            maxLocationId: info.maxLocationId
        };

        MapHandler.addNodes(info.nodes);
        MapHandler.setBoundingBox(info.box);
        totalCount = info.count;

        Database.getLocations()
            .then(locs => MapHandler.addLocations(locs, true))
            .catch(console.error);
    }

    const parseLocation = (loc: ArrayBuffer): DatabaseTypes.Location => {
        const pbf = new Pbf(new Uint8Array(loc));
        return {
            id: pbf.readString(),
            expeditieName: expeditieNameShort,
            personId: personMap[pbf.readVarint()],
            time: pbf.readDouble(),
            longitude: pbf.readDouble(),
            latitude: pbf.readDouble()
        };
    };

    export function parseLocations(batchNumber: number, locs: ArrayBuffer[]) {
        receivedCount += locs.length;
        LoadingBar.setLoadingText(`Received ${receivedCount} out of ${totalCount} locations.`);

        const dbLocs: DatabaseTypes.Location[] = locs.map(parseLocation);
        locations.push(...dbLocs);

        MapHandler.addLocations(dbLocs);
    }

    export function done() {
        LoadingBar.setLoadingDone();
        MapHandler.updateMap();
        Database.putLocations(locations)
            .catch(console.error);
        Database.putExpeditie(expeditie)
            .catch(console.error);
    }
}
