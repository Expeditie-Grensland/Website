import { SocketTypes } from '../sockets/types';

export namespace DataBaseTypes {
    export interface Expeditie {
        name: string;
        nodes: SocketTypes.Node[];
        box: SocketTypes.BoundingBox;
        count: number;
        maxLocationId: string;
    }

    export interface Location {
        id: number;
        expeditieName: string;
        personId: string;
        time: number;
        longitude: number;
        latitude: number;
    }
}
