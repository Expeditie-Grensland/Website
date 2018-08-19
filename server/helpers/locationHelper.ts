import * as turf from '@turf/turf';

import { Location } from '../components/location';
import { Util } from '../components/document/util';
import { LocationDocument, LocationSchema } from '../components/location/model';
import { RouteNodeOrID } from '../components/routenode/model';

export namespace LocationHelper {
    const lastLocationsMap: Map<string, Promise<[LocationDocument, LocationDocument]>> = new Map();

    /**
     * Assigns the visual area of the before-last location. This should be called when a new location is added to the
     * models.
     *
     * Note: This function does not change the _current_ LocationDocument, but the one added before the current.
     * @param {LocationDocument} location The location that was added to the models
     * @returns {LocationDocument} The value of the `location` parameter.
     */
    export async function setVisualArea(location: LocationDocument): Promise<LocationDocument> {
        const area = await calculateVisualArea(location);
        const lastLocations = await getLastLocationsCached(location.node);

        await Location.setLocationVisualArea(area)(lastLocations[1]);
        await addLocation(location);

        return location;
    }

    export async function setVisualAreas(locations: LocationDocument[]): Promise<LocationDocument[]> {
        let nodeToLocationMap: Map<string, LocationDocument[]> = new Map();

        for (let location of locations) {
            let array = nodeToLocationMap.get(Util.getObjectID(location.node));

            if (array === undefined) {
                array = [];
            }

            array.push(location);

            nodeToLocationMap.set(Util.getObjectID(location.node), array);
        }

        const bulk = LocationSchema.collection.initializeUnorderedBulkOp();

        for (let locations of nodeToLocationMap.values()) {
            locations = sortByTimestampDescending(locations);

            const lastLocations = await getLastLocations(locations.slice(-2));

            lastLocationsMap.set(Util.getObjectID(lastLocations[1].node), Promise.resolve(lastLocations));

            for (let i = 3; i < locations.length; i++) {
                const visualArea = await calculateVisualArea(locations[i]);

                locations[i - 1].visualArea = visualArea;
                bulk.find({ _id: locations[i - 1]._id }).update({ $set: { visualArea: visualArea } });

                addLocation(locations[i]);
            }
        }

        return bulk.execute().then(() => locations);
    }

    async function calculateVisualArea(location: LocationDocument): Promise<number> {
        return getLastLocationsCached(Util.getObjectID(location.node)).then(lastLocations => {
            if (lastLocations != undefined) {
                const triangle = turf.polygon([
                    [
                        [lastLocations[0].lon, lastLocations[0].lat],
                        [lastLocations[1].lon, lastLocations[1].lat],
                        [location.lon, location.lat],

                        [lastLocations[0].lon, lastLocations[0].lat]
                    ]
                ]);

                return turf.area(triangle);
            }
            //Either the first or the last element in the array. These should just be loaded first
            return Number.POSITIVE_INFINITY;
        });
    }

    function addLocation(location: LocationDocument) {
        let lastLocations = getLastLocationsCached(location.node).then(lastLocations => {
            return <[LocationDocument, LocationDocument]>[lastLocations[1], location];
        });

        lastLocationsMap.set(Util.getObjectID(location.node), lastLocations);
    }

    async function getLastLocations(locations: LocationDocument[]): Promise<[LocationDocument, LocationDocument] | undefined> {
        return Promise.resolve(locations)
            .then(sortByTimestampDescending)
            .then(locations => {
                if (locations.length > 1) {
                    return <[LocationDocument, LocationDocument]>[locations[1], locations[0]];
                }
                return undefined;
            });
    }

    function getLastLocationsCached(node: RouteNodeOrID): Promise<[LocationDocument, LocationDocument] | undefined> {
        let lastLocations = lastLocationsMap.get(Util.getObjectID(node));

        if (lastLocations === undefined) {
            lastLocations = Location.getLocationsInNodeByTimestampDescending(Util.getObjectID(node), 1, 2).then(getLastLocations);

            lastLocationsMap.set(Util.getObjectID(node), lastLocations);
        }

        return lastLocations;
    }

    export function sortByTimestampDescending(locations: LocationDocument[]): LocationDocument[] {
        return locations.sort((l1, l2) => l2.timestamp - l1.timestamp);
    }
}
