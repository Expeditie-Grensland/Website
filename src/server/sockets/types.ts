// The contents of this file should be kept in sync between the client and server version

export namespace SocketTypes {
    export interface Expeditie {
        id: string;
        nodes: Node[];
        box: BoundingBox;
        personMap: PersonMap;
        count: number;
        lastUpdateTime: number;
    }

    export interface Node {
        id: string;
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

    export interface BaseStoryElement {
        id: string;
        type: "text" | "gallery" | "location";
        expeditieId: string;
        geoNodeId: string;
        time: number;
        latitude?: number;
        longitude?: number;
    }

    export interface TextStoryElement extends BaseStoryElement {
        type: "text";
        title: string;
        text: string;
    }

    export interface LocationStoryElement extends BaseStoryElement {
        type: "location";
        name: string;
    }

    export interface GalleryStoryElement extends BaseStoryElement {
        type: "gallery";
        pictures: GalleryItem[];
    }

    export interface GalleryItem {
        file: string; // file path
        mime: string;
        caption: string;
    }

    export type StoryElement = TextStoryElement | LocationStoryElement | GalleryStoryElement;
}
