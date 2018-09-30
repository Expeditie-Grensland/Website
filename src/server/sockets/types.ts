// The contents of this file should be kept in sync between the client and server version

export namespace SocketTypes {
    export interface RouteNode {
        id: number,
        _id: string;
        color: string;
    }

    // export interface Location {
    //     id: number;
    //     node: number;
    //     timestamp: number;
    //     lat: number;
    //     lon: number;
    // }

    /**
     * [id, node, timestamp, lat, lon]
     */
    export type Location = [number, number, number, number, number]

    export interface BoundingBox {
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
    }

    export interface Info {
        nodes: RouteNode[],
        box: BoundingBox
    }
}
