import { DatabaseModel } from './model';
import { DatabaseTypes } from './types';
import {SocketTypes} from "../sockets/types"

declare var expeditieNameShort: string;

export namespace Database {
    let db: DatabaseModel;

    export const init = () => {
        db = new DatabaseModel();

        db.open().catch(function (e) {
            console.error('Open failed: ' + e.stack);
        });
    };

    export const getLocations = (): Promise<DatabaseTypes.Location[]> =>
        db.locations.where({ expeditieName: expeditieNameShort }).toArray();

    export const getLastUpdateTime = (): Promise<number | undefined> =>
        db.expedities.get(expeditieNameShort)
            .then(expeditie => expeditie && expeditie.lastUpdateTime);

    export const putExpeditie = (expeditie: DatabaseTypes.Expeditie) =>
        db.expedities.put(expeditie);

    export const getExpeditie = (): Promise<DatabaseTypes.Expeditie | undefined> =>
        db.expedities.get(expeditieNameShort);

    export const putLocations = (locs: DatabaseTypes.Location[]): Promise<any> => {
        if (locs.length == 0) return Promise.resolve();
        return db.locations.bulkPut(locs.slice(0, 1000))
            .then(() => putLocations(locs.slice(1000)))
    }

    export const putStoryElements = (els: SocketTypes.StoryElement[]): Promise<any> => {
        if (els.length == 0) return Promise.resolve();
        return db.storyelements.bulkPut(els);
    }

    export const getStoryElements = (): Promise<SocketTypes.StoryElement[]> =>
        getExpeditie()
            .then(expeditie => expeditie ? db.storyelements.where({expeditieId: expeditie.id}).sortBy('time') : [])
}
