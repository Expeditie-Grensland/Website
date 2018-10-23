import Dexie from 'dexie';
import { DatabaseTypes } from './types';

export class DatabaseModel extends Dexie {
    expedities!: Dexie.Table<DatabaseTypes.Expeditie, string>;
    locations!: Dexie.Table<DatabaseTypes.Location, string>;

    constructor() {
        super('ExpeditieGrensland');

        this.version(1).stores({
            expedities: 'name',
            locations: 'id,expeditieName'
        });
    }
}
