import {TableData} from "../database/Tables"
import {Place} from "../database/Place"
import {Route} from "../database/Route"
import {Util} from "../database/Util"
import {Location} from "../database/Location"
import * as turf from "@turf/turf"

export namespace PlaceHelper {

    import LocationDocument = TableData.Location.LocationDocument
    import PlaceDocument = TableData.Place.PlaceDocument
    import RouteNodeOrID = TableData.RouteNodeOrID

    const historyLength = 300

    //Minimum location density to form a place in places/km^2.
    const minLocationDensity = 80000
    //The minimum amount of locations to form a place.
    const minLocationCount = 10

    let cachedPlaces: Promise<PlaceDocument[]>
    let locationHistory = new Map<string, Promise<LocationDocument[]>>()

    export function resetCache() {
        cachedPlaces = undefined
        locationHistory = new Map()
    }

    export async function findPlaceForLocation(location: LocationDocument): Promise<LocationDocument> {
        // 1. Find if previous place has a location.
        // 1a. Determine if this location falls within the place found.
        // 1b. Add place to location.
        // 2. Find if previous locations can form a place (based on density?)
        // 2a. Find if there is already a place nearby in this route node or other route nodes.
        // 2b. Merge locations found.

        const previousPlace = await findPlaceInPreviousLocation(location)

        if(previousPlace !== undefined) {
            const locationsInPreviousPlace = await Location.getLocationsInPlace(previousPlace)
            locationsInPreviousPlace.push(location)

            const circle = getSmallestEnclosingCircle(locationsInPreviousPlace)

            if(locationsInPreviousPlace.length / circle.area >= minLocationDensity) {
                const expandedPlace = Place.expandPlaceTo(circle.lat, circle.lon, circle.r)(previousPlace)
                addToPlaceCache(expandedPlace)

                return Location.setPlace(await expandedPlace)(location)
            }
        } else {
            const place = await tryToCreatePlaceWith(location)

            if(place !== undefined) {
                const placeDoc = tryToMergePlaceWithExisting(place[0], place[1])

                addToPlaceCache(placeDoc)

                await placeDoc
            }
        }

        addLocationToHistory(location)


        return location
    }

    export async function tryToMergePlaceWithExisting(place: TableData.Place.Place, locationsInPlace: LocationDocument[]): Promise<PlaceDocument> {
        //const places = getCachedPlaces()

        //TODO this

        const placeDoc = await Place.createPlace(place)

        const promises = []

        for(let location of locationsInPlace) {
            promises.push(Location.setPlace(placeDoc)(location))

            location.place = Util.getObjectID(placeDoc)
        }

        await Promise.all(promises)

        return placeDoc
    }


    export async function tryToCreatePlaceWith(location: LocationDocument): Promise<[TableData.Place.Place, LocationDocument[]] | undefined> {
        const history = await getCachedLocationHistoryForNode(location.node)
        const locationsInPlace = history.slice(0, minLocationCount)

        let circle = getSmallestEnclosingCircle(locationsInPlace)
        let i = minLocationCount
        let isValidPlace = false

        while(locationsInPlace.length / circle.area >= minLocationDensity) {
            console.log("Place length: " + locationsInPlace.length + " circle area: " + circle.area + " density: " + locationsInPlace.length / circle.area)
            if(i >= historyLength) {
                console.log("Uh-oh, place size is greater than history length. This should be impossible.")
            }

            const nextPlace = history[i++]

            if(nextPlace.place !== undefined) {
                break; //TODO merge or something?
            }

            locationsInPlace.push(nextPlace)
            circle = getSmallestEnclosingCircle(locationsInPlace)
            isValidPlace = true
        }

        if(isValidPlace) {
            const place: TableData.Place.Place = {
                lat: circle.lat,
                lon: circle.lon,
                radius: circle.r,
                nodes: [Util.getObjectID(location.node)]
            }

            return [place, locationsInPlace]
        }


        return undefined
    }

    export function getSmallestEnclosingCircle(locations: LocationDocument[]): SmallestEnclosingCircle.EnclosingCircle {
        const points = locations.map(location => { return {x: location.lon, y: location.lat} })
        const circle = SmallestEnclosingCircle.makeCircle(points)

        return {
            lon: circle.x,
            lat: circle.y,
            r: circle.r,
            area: Math.pow(circle.r, 2) * Math.PI
        }
    }

    export async function findPlaceInPreviousLocation(location: LocationDocument): Promise<PlaceDocument | undefined> {
        const history = await getCachedLocationHistoryForNode(location.node)
        const lastLocation = history.find((loc) => loc._id !== location._id)

        if(lastLocation !== undefined && lastLocation.place !== undefined) {
            return Place.getPlaceDocument(lastLocation.place)
        }
        return undefined
    }

    export function getCachedPlaces(): Promise<PlaceDocument[]> {
        if(cachedPlaces === undefined) {
            cachedPlaces = Place.getPlaces()
        }
        return cachedPlaces
    }

    export async function getCachedLocationHistoryForNode(node: RouteNodeOrID): Promise<LocationDocument[]> {
        let history = locationHistory.get(Util.getObjectID(node))

        if(history === undefined) {
            const nodeDoc = await Route.getRouteNode(node)

            history = Location.getLocationsInNodeByTimestampDescending(nodeDoc, 0, historyLength)
            locationHistory.set(Util.getObjectID(node), history)
        }

        return history
    }

    export function addLocationToHistory(location: LocationDocument) {
        const history = getCachedLocationHistoryForNode(location.node)

        history.then(history => {
            let cachedIdx = -1
            const cached = history.find((l, idx) => {
                cachedIdx = idx
                return l._id === location._id
            })

            if(cached !== undefined) {
                cached.place = location.place
                history[cachedIdx] = cached
            } else {
                history.unshift(location)

                while (history.length > historyLength) {
                    history.pop()
                }
            }
        })

        locationHistory.set(Util.getObjectID(location.node), history)
    }

    export function addToPlaceCache(place: Promise<PlaceDocument>) {
        const places = getCachedPlaces()

        cachedPlaces = Promise.all([places, place]).then(([places, place]) => {
            const existingPlace = places.find(p => p._id == place._id)

            if(existingPlace !== undefined) {
                existingPlace.lat = place.lat
                existingPlace.lon = place.lon
                existingPlace.radius = place.radius
                existingPlace.nodes = place.nodes
            } else {
                places.push(place)
            }

            return places
        })
    }

    namespace SmallestEnclosingCircle {
        export interface EnclosingCircle {
            lon: number //lon
            lat: number //lat
            r: number //radius (km)
            area: number //km^2
        }

        /*
         * Smallest enclosing circle - Library (JavaScript)
         *
         * Copyright (c) 2017 Project Nayuki
         * https://www.nayuki.io/page/smallest-enclosing-circle
         *
         * This program is free software: you can redistribute it and/or modify
         * it under the terms of the GNU Lesser General Public License as published by
         * the Free Software Foundation, either version 3 of the License, or
         * (at your option) any later version.
         *
         * This program is distributed in the hope that it will be useful,
         * but WITHOUT ANY WARRANTY; without even the implied warranty of
         * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
         * GNU Lesser General Public License for more details.
         *
         * You should have received a copy of the GNU Lesser General Public License
         * along with this program (see COPYING.txt and COPYING.LESSER.txt).
         * If not, see <http://www.gnu.org/licenses/>.
         */

        /*
         * Returns the smallest circle that encloses all the given points. Runs in expected O(n) time, randomized.
         * Input: A list of points, where each point is an object {x: float, y: float}, e.g. [{x:0,y:5}, {x:3.1,y:-2.7}].
         * Output: A circle object of the form {x: float, y: float, r: float}.
         * Note: If 0 points are given, null is returned. If 1 point is given, a circle of radius 0 is returned.
         */
        // Initially: No boundary points known
        export function makeCircle(points) {
            // Clone list to preserve the caller's data, do Durstenfeld shuffle
            let shuffled = points.slice();
            for (let i = points.length - 1; i >= 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                j = Math.max(Math.min(j, i), 0);
                let temp = shuffled[i];
                shuffled[i] = shuffled[j];
                shuffled[j] = temp;
            }

            // Progressively add points to circle or recompute circle
            let c = null;
            for (let i = 0; i < shuffled.length; i++) {
                let p = shuffled[i];
                if (c == null || !isInCircle(c, p))
                    c = makeCircleOnePoint(shuffled.slice(0, i + 1), p);
            }
            return c;
        }


        // One boundary point known
        function makeCircleOnePoint(points, p) {
            let c = {x: p.x, y: p.y, r: 0};
            for (let i = 0; i < points.length; i++) {
                let q = points[i];
                if (!isInCircle(c, q)) {
                    if (c.r == 0)
                        c = makeDiameter(p, q);
                    else
                        c = makeCircleTwoPoints(points.slice(0, i + 1), p, q);
                }
            }
            return c;
        }


        // Two boundary points known
        function makeCircleTwoPoints(points, p, q) {
            let circ = makeDiameter(p, q);
            let left = null;
            let right = null;

            // For each point not in the two-point circle
            points.forEach(function (r) {
                if (isInCircle(circ, r))
                    return;

                // Form a circumcircle and classify it on left or right side
                let cross = crossProduct(p.x, p.y, q.x, q.y, r.x, r.y);
                let c = makeCircumcircle(p, q, r);
                if (c == null)
                    return;
                else if (cross > 0 && (left == null || crossProduct(p.x, p.y, q.x, q.y, c.x, c.y) > crossProduct(p.x, p.y, q.x, q.y, left.x, left.y)))
                    left = c;
                else if (cross < 0 && (right == null || crossProduct(p.x, p.y, q.x, q.y, c.x, c.y) < crossProduct(p.x, p.y, q.x, q.y, right.x, right.y)))
                    right = c;
            });

            // Select which circle to return
            if (left == null && right == null)
                return circ;
            else if (left == null)
                return right;
            else if (right == null)
                return left;
            else
                return left.r <= right.r ? left : right;
        }


        function makeCircumcircle(p0, p1, p2) {
            // Mathematical algorithm from Wikipedia: Circumscribed circle
            let ax = p0.x, ay = p0.y;
            let bx = p1.x, by = p1.y;
            let cx = p2.x, cy = p2.y;
            let ox = (Math.min(ax, bx, cx) + Math.max(ax, bx, cx)) / 2;
            let oy = (Math.min(ay, by, cy) + Math.max(ay, by, cy)) / 2;
            ax -= ox;
            ay -= oy;
            bx -= ox;
            by -= oy;
            cx -= ox;
            cy -= oy;
            let d = (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) * 2;
            if (d == 0)
                return null;
            let x = ox + ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
            let y = oy + ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
            let ra = distance(x, y, p0.x, p0.y);
            let rb = distance(x, y, p1.x, p1.y);
            let rc = distance(x, y, p2.x, p2.y);
            return {x: x, y: y, r: Math.max(ra, rb, rc)};
        }


        function makeDiameter(p0, p1) {
            let x = (p0.x + p1.x) / 2;
            let y = (p0.y + p1.y) / 2;
            let r0 = distance(x, y, p0.x, p0.y);
            let r1 = distance(x, y, p1.x, p1.y);
            return {x: x, y: y, r: Math.max(r0, r1)};
        }


        /* Simple mathematical functions */

        const MULTIPLICATIVE_EPSILON = 1 + 1e-14;

        function isInCircle(c, p) {
            return c != null && distance(p.x, p.y, c.x, c.y) <= c.r * MULTIPLICATIVE_EPSILON;
        }

        // Returns twice the signed area of the triangle defined by (x0, y0), (x1, y1), (x2, y2).
        function crossProduct(x0, y0, x1, y1, x2, y2) {
            return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
        }


        function distance(x0, y0, x1, y1) {
            return turf.distance(turf.point([x0, y0]), turf.point([x1, y1]))
            //return Math.hypot(x0 - x1, y0 - y1);
        }
    }
}
