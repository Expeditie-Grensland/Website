import Dexie from 'dexie';
import { DataBaseTypes } from './types';

export class LocalDatabase extends Dexie {
    locations!: Dexie.Table<DataBaseTypes.Location, string>;

    constructor() {
        super('ExpeditieGrensland');

        this.version(1).stores({
            locations: 'id,expeditieId'
        });
    }
}
