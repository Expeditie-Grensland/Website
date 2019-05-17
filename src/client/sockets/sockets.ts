import { MapHandler } from '../map/mapHandler';
import { LoadingBar } from '../map/loadingBar';
import { SocketTypes } from './types';
import { DatabaseTypes } from '../database/types';
import { Database } from '../database';
import {StoryHandler} from "../story/handler"

declare var expeditieNameShort: string;

export namespace Sockets {
    const locations: DatabaseTypes.Location[] = [];
    let expeditie: DatabaseTypes.Expeditie;
    const story: SocketTypes.StoryElement[] = [];
    let personMap: SocketTypes.PersonMap;
    let personInfo: SocketTypes.PersonInfo;

    let totalCount: number;
    let receivedCount: number = 0;

    export function parseInfo(info: SocketTypes.Expeditie) {
        LoadingBar.setLoadingText('Route info ontvangen.');
        personMap = info.personMap;
        personInfo = info.personInfo;

        console.log(personInfo);

        expeditie = {
            id: info.id,
            name: expeditieNameShort,
            nodes: info.nodes,
            box: info.box,
            lastUpdateTime: info.lastUpdateTime
        };

        StoryHandler.init(personInfo, info.nodes);

        MapHandler.addNodes(info.nodes);
        MapHandler.setBoundingBox(info.box);
        totalCount = info.count;

        Database.getLocations()
            .then(locs => MapHandler.addLocations(locs, true))
            .catch(console.error);
        Database.getStoryElements()
            .then(els => StoryHandler.appendStoryElements(els))
            .catch(console.error);
    }

    export const parseLocations = (locs: ArrayBuffer, ack: () => void) => {
        const length = Math.floor(locs.byteLength / 37);

        receivedCount += length;
        LoadingBar.setLoadingText(`${receivedCount} van ${totalCount} locaties ontvangen.`);

        const dbLocs: DatabaseTypes.Location[] = [];
        const view = new DataView(locs);

        for (let i = 0; i < length; i++) {
            const offset = i * 37;

            dbLocs.push({
                id: view.getUint32(offset).toString(16) + view.getUint32(offset + 4).toString(16) + view.getUint32(offset + 8).toString(16),
                expeditieName: expeditieNameShort,
                personId: personMap[view.getUint8(offset + 12)],
                time: view.getFloat64(offset + 13),
                longitude: view.getFloat64(offset + 21),
                latitude: view.getFloat64(offset + 29)
            });
        }

        locations.push(...dbLocs);

        MapHandler.addLocations(dbLocs);

        ack();
    };

    export function parseStoryElements(elements: SocketTypes.StoryElement[]) {
        LoadingBar.setLoadingText('Verhaalinfo ontvangen.');

        story.push(...elements);

        StoryHandler.appendStoryElements(elements);
    }

    export function done() {
        LoadingBar.setLoadingDone();
        MapHandler.updateMap();
        Database.putLocations(locations)
            .catch(console.error);
        Database.putStoryElements(story)
            .catch(console.error);
        Database.putExpeditie(expeditie)
            .catch(console.error);
    }
}
