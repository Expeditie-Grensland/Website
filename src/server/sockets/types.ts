// The contents of this file should be kept in sync between the client and server version

export namespace SocketTypes {
    export interface Expeditie {
        nodes: Node[];
        box: BoundingBox;
        personMap: PersonMap;
        count: number;
        maxLocationId: string;
    }

    export interface Node {
        personIds: string[];
        timeFrom: number;
        timeTill: number;
        color: string;
    }

    export type PersonMap = {[num: number]: string};

    /**
     * Location pbf:
     * - id: string
     * - person: fixed32
     * - time: double
     * - longitude: double
     * - latitude: double
     */

    export interface BoundingBox {
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
    }
}
