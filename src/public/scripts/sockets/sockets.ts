import { MapHandler } from '../map/mapHandler';
import { LoadingBar } from '../map/loadingBar';
import { SocketTypes } from './types';

export namespace Sockets {
    export function parseInfo(info: SocketTypes.Info) {
        LoadingBar.setLoadingText('Received route info.');

        MapHandler.addNodes(info.nodes);
        MapHandler.setBoundingBox(info.box);
    }

    export function parseLocations(batchNumber: number, locations: SocketTypes.Location[]) {
        LoadingBar.setLoadingText(
            `Received location batch ${batchNumber} with ${locations.length} locations.`
        );

        MapHandler.addLocations(locations);
    }

    export function done() {
        LoadingBar.setLoadingDone();
    }
}
