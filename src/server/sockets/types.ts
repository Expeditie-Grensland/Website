// The contents of this file should be kept in sync between the client and server version

export namespace SocketTypes {
    export interface RouteNode {
        _id: string;
        color: string;
    }

    export interface Location {
        _id: string;
        node: string;
        timestamp: number;
        lat: number;
        lon: number;
    }

    export interface BoundingBox {
        minLat: number;
        maxLat: number;
        minLon: number;
        maxLon: number;
    }
}
