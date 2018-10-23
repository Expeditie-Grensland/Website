import { DatabaseModel } from './model';
import { DatabaseTypes } from './types';

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

    export const getLastLocationId = (): Promise<string | undefined> =>
        db.expedities.get(expeditieNameShort)
            .then(expeditie => expeditie && expeditie.maxLocationId);

    export const putExpeditie = (expeditie: DatabaseTypes.Expeditie) =>
        db.expedities.put(expeditie);

    export const putLocations = (locations: DatabaseTypes.Location[]) =>
        db.locations.bulkPut(locations);
}
