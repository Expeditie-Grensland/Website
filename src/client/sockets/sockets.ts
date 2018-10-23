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
            .then(MapHandler.addLocations)
            .catch(console.error);
    }

    export function parseLocations(batchNumber: number, locs: SocketTypes.Location[]) {
        receivedCount += locs.length;
        LoadingBar.setLoadingText(`Received ${receivedCount} out of ${totalCount} locations.`);

        const dbLocs: DatabaseTypes.Location[] = locs.map(loc => {
            return {
                id: loc[0],
                expeditieName: expeditieNameShort,
                personId: personMap[loc[1]],
                time: loc[2],
                longitude: loc[4],
                latitude: loc[3]
            }
        });
        locations.push(...dbLocs);

        MapHandler.addLocations(dbLocs);
    }

    export function done() {
        LoadingBar.setLoadingDone();
        Database.putLocations(locations)
            .catch(console.error);
        Database.putExpeditie(expeditie)
            .catch(console.error);
    }
}
