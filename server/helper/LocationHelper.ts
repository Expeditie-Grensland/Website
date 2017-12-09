import {TableData, Tables} from "../database/Tables";
import {Location} from "../database/Location"
import {Util} from "../database/Util"
import * as turf from "@turf/turf"

export namespace LocationHelper {
    import LocationDocument = TableData.Location.LocationDocument;
    import RouteNodeOrID = TableData.RouteNodeOrID

    export type ZoomLevel = number

    export const ZOOM_LEVEL_RANGE: ZoomLevel[] = Array.from(new Array(20), (x,i) => i)

    const lastLocationsMap: Map<string, Promise<[LocationDocument[], LocationDocument]>> = new Map()

    /**
     * Assigns the zoom level of the before-last location. This should be called when a new location is added to the
     * database.
     *
     * Note: This function does not change the _current_ LocationDocument, but the one added before the current.
     * @param {TableData.Location.LocationDocument} newLocation The location that was added to the database
     * @returns {TableData.Location.LocationDocument} The value of the `newLocation` parameter.
     */
    export async function calculateZoomLevel(newLocation: LocationDocument): Promise<LocationDocument> {
        const zoomLevel = await findLowestZoomLevel(newLocation)
        const lastLocations = await getLastLocationsCached(newLocation.node)

        await Location.setLocationZoomLevel(zoomLevel)(lastLocations[1])
        await addLocation(newLocation)

        return newLocation
    }

    export async function calculateZoomLevels(newLocations: LocationDocument[]): Promise<LocationDocument[]> {
        let nodeToLocationMap: Map<string, LocationDocument[]> = new Map()

        for(let location of newLocations) {
            let array = nodeToLocationMap.get(Util.getObjectID(location.node))

            if(array === undefined) {
                array = []
            }

            array.push(location)

            nodeToLocationMap.set(Util.getObjectID(location.node), array)
        }

        const bulk = Tables.Location.collection.initializeUnorderedBulkOp()

        for(let locations of nodeToLocationMap.values()) {
            locations = sortByTimestampDescending(locations)

            const lastLocations = await getLastLocations(locations.slice(-2))

            lastLocationsMap.set(Util.getObjectID(lastLocations[1].node), Promise.resolve(lastLocations))

            for (let i = 3; i < locations.length; i++) {
                const zoomLevel = await findLowestZoomLevel(locations[i])

                locations[i-1].zoomLevel = zoomLevel
                bulk.find({_id: locations[i-1]._id}).update({$set: {zoomLevel: zoomLevel}})

                addLocation(locations[i])
            }
        }

        return bulk.execute().then(() => newLocations)
    }

    function findLowestZoomLevel(location: LocationDocument, idx: number = 0): Promise<number> {
        return shouldLocationBeDisplayedAtZoomLevel(location, ZOOM_LEVEL_RANGE[idx]).then(display => {
            if(display) {
                return ZOOM_LEVEL_RANGE[idx]
            }
            return findLowestZoomLevel(location, idx+1)
        })
    }

    function addLocation(location: LocationDocument) {
        let lastLocations = lastLocationsMap.get(Util.getObjectID(location.node)).then(lastLocations => {
            let oldL0 = lastLocations[0]
            let oldL1 = lastLocations[1]

            let newL0 = oldL0.map((oldL, index) => (index >= oldL1.zoomLevel) ? oldL1 : oldL)
            let newL1 = location

            return [newL0, newL1] as [LocationDocument[], LocationDocument]
        })

        lastLocationsMap.set(Util.getObjectID(location.node), lastLocations)
    }

    /**
     * Converts between the area of a polygon and a zoomLevel
     * @param {number} area in m^2
     * @returns {number} the largest zoomLevel this feature should be displayed at, from 0 up to and including 19.
     */
    function areaToZoomLevel(area: number): ZoomLevel {
        //19 - ((x/(3*10^4))^3)
        const zl = 19 - Math.pow(area / 50000, 3)
        //const z1 = 19 - (area / Math.pow(2, 15))

        return Math.floor(zl > 0 ? zl : 0)
    }

    function shouldLocationBeDisplayedAtZoomLevel(location: LocationDocument, zoomLevel: ZoomLevel): Promise<boolean> {
        return getLastLocationsCached(Util.getObjectID(location.node)).then(lastLocations => {
            if(lastLocations != undefined) {
                const triangle = turf.polygon([[
                    [lastLocations[0][zoomLevel].lon, lastLocations[0][zoomLevel].lat],
                    [lastLocations[1].lon, lastLocations[1].lat],
                    [location.lon, location.lat],

                    [lastLocations[0][zoomLevel].lon, lastLocations[0][zoomLevel].lat],
                ]])

                const area = turf.area(triangle)

                return areaToZoomLevel(area) <= zoomLevel
            }
            return true
        })
    }

    function getLastLocations(locations: LocationDocument[]): Promise<[LocationDocument[], LocationDocument] | undefined> {
        return Promise.resolve(locations).then(sortByTimestampDescending)
            .then(locations => {
                if(locations.length > 1) {
                    let l1: LocationDocument = locations[0]
                    let l0: LocationDocument[] = ZOOM_LEVEL_RANGE.map(zoomLevel =>
                        locations.slice(1).find(l => l.zoomLevel <= zoomLevel)
                    )

                    return [l0, l1] as [LocationDocument[], LocationDocument]
                }
                return undefined
            })
    }

    function getLastLocationsCached(node: RouteNodeOrID): Promise<[LocationDocument[], LocationDocument] | undefined> {
        let lastLocations = lastLocationsMap.get(Util.getObjectID(node))

        if(lastLocations === undefined) {
            lastLocations = Location.getLocationsInNode(Util.getObjectID(node))
                .then(locations => locations.slice(1))
                .then(getLastLocations)

            lastLocationsMap.set(Util.getObjectID(node), lastLocations)
        }

        return lastLocations
    }

    export function sortByTimestampAscending(locations: LocationDocument[]): LocationDocument[] {
        return locations.sort((l1, l2) => l1.timestamp - l2.timestamp)
    }

    export function sortByTimestampDescending(locations: LocationDocument[]): LocationDocument[] {
        return locations.sort((l1, l2) => l2.timestamp - l1.timestamp)
    }
}