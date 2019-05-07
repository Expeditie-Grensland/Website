import { SocketTypes } from '../sockets/types';

export namespace DatabaseTypes {
    export interface Expeditie {
        id: string;
        name: string;
        nodes: SocketTypes.Node[];
        box: SocketTypes.BoundingBox;
        maxLocationId?: string;
    }

    export interface Location {
        id: string;
        expeditieName: string;
        personId: string;
        time: number;
        longitude: number;
        latitude: number;
    }
}

