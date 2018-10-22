import { MapHandler } from '../map/mapHandler';
import { LoadingBar } from '../map/loadingBar';
import { SocketTypes } from './types';

declare var expeditieNameShort: string;

export namespace Sockets {
    let personMap: { [numId: number]: string };
    let totalCount: number;
    let receivedCount: number = 0;

    export function parseInfo(expeditie: SocketTypes.Expeditie) {
        personMap = expeditie.personMap;

        LoadingBar.setLoadingText('Received route info.');

        MapHandler.addNodes(expeditie.nodes);
        MapHandler.setBoundingBox(expeditie.box);
        totalCount = expeditie.count;
    }

    export function parseLocations(batchNumber: number, locations: SocketTypes.Location[]) {
        receivedCount += locations.length;

        LoadingBar.setLoadingText(`Received ${receivedCount} out of ${totalCount} locations.`);

        MapHandler.addLocations(locations);
        //
        // const dbLocations: DataBaseTypes.Location[] = locations.map(l => {
        //     return {
        //         id: l[0],
        //         expeditieId,
        //         personId: personMap[l[1]],
        //         time: l[2],
        //         longitude: l[3],
        //         latitude: l[4]
        //     }
        // });
        //
        // let db = new LocalDatabase();
        //
        // db.open().catch(function (e) {
        //     console.error("Open failed: " + e.stack);
        // });
        //
        // db.locations.bulkPut(dbLocations);
    }

    export function done() {
        LoadingBar.setLoadingDone();
    }
}
