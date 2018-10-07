// The contents of this file should be kept in sync between the client and server version

export namespace SocketTypes {
    export interface Node {
        personIds: number[];
        timeFrom: number;
        timeTill: number;
        color: string;
    }

    export type PersonMap = [string, number][];

    /**
     * [id, person, time, latitude, longitude]
     */
    export type Location = [number, number, number, number, number];

    export interface BoundingBox {
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
    }

    export interface Info {
        nodes: Node[];
        box: BoundingBox;
        personMap: PersonMap;
        count: number;
    }
}
