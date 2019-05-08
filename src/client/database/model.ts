import Dexie from 'dexie';
import { DatabaseTypes } from './types';
import {SocketTypes} from "../sockets/types"

export class DatabaseModel extends Dexie {
    expedities!: Dexie.Table<DatabaseTypes.Expeditie, string>;
    locations!: Dexie.Table<DatabaseTypes.Location, string>;
    storyelements!: Dexie.Table<SocketTypes.StoryElement, string>;

    constructor() {
        super('ExpeditieGrensland');

        this.version(1).stores({
            expedities: 'name',
            locations: 'id,expeditieName'
        });

        this.version(2).stores({
            storyelements: 'expeditieId'
        });
    }
}
