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
        id: string;
        personIds: number[];
        timeFrom: number;
        timeTill: number;
        color: string;
    }

    export type PersonMap = {[num: number]: string};

    /**
     * [id, person, timestamp, latitude, longitude]
     */
    export type Location = [string, number, number, number, number];

    export interface BoundingBox {
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
    }
}
