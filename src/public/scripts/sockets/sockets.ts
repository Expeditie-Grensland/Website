import { MapHandler } from '../map/mapHandler';
import { LoadingBar } from '../map/loadingBar';
import { SocketTypes } from './types';

export namespace Sockets {
    let totalCount: number;
    let receivedCount: number = 0;

    export function parseInfo(info: SocketTypes.Info) {
        LoadingBar.setLoadingText('Received route info.');

        MapHandler.addNodes(info.nodes);
        MapHandler.setBoundingBox(info.box);
        totalCount = info.count;
    }

    export function parseLocations(batchNumber: number, locations: SocketTypes.Location[]) {
        receivedCount += locations.length;

        LoadingBar.setLoadingText(`Received ${receivedCount} out of ${totalCount} locations.`);

        MapHandler.addLocations(locations);
    }

    export function done() {
        LoadingBar.setLoadingDone();
    }
}
