import {GeoLocation} from "./geolocation"
import {Rectangle} from "./rectangle"

export class Polygon {
    constructor(public readonly points: GeoLocation[]) {}

    readonly bounds = this.calculateBounds()

    calculateBounds(): Rectangle {
        let minLat = Number.MAX_VALUE
        let maxLat = Number.MIN_VALUE
        let minLon = Number.MAX_VALUE
        let maxLon = Number.MIN_VALUE

        for(let point of this.points) {
            const lat = point.lat
            const lon = point.lon

            minLat = Math.min(minLat, lat)
            maxLat = Math.max(maxLat, lat)
            minLon = Math.min(minLon, lon)
            maxLon = Math.max(maxLon, lon)
        }

        return new Rectangle(new GeoLocation(minLat, maxLat), new GeoLocation(minLon, maxLon))
    }

    /**
     * Polygon contains function, returns true if the GeoLocation is inside this polygon.
     * Taken from https://stackoverflow.com/a/13951139
     * @param {GeoLocation} location
     * @returns {boolean} Whether the passed location is in this polygon
     */
    contains(location: GeoLocation): boolean {
        if(!this.bounds.contains(location))
            return false

        let lastPoint = this.points[this.points.length - 1]
        let isInside = false
        let x = location.lon

        for(let point of this.points) {
            let x1 = lastPoint.lon
            let x2 = point.lon
            let dx = x2 - x1

            if(Math.abs(dx) > 180.0) {
                // we have, most likely, just jumped the dateline (could do further validation to this effect if needed).  normalise the numbers.
                if (x > 0) {
                    while (x1 < 0)
                        x1 += 360;
                    while (x2 < 0)
                        x2 += 360;
                } else {
                    while (x1 > 0)
                        x1 -= 360;
                    while (x2 > 0)
                        x2 -= 360;
                }
                dx = x2 - x1;
            }

            if ((x1 <= x && x2 > x) || (x1 >= x && x2 < x)) {
                let grad = (point.lat - lastPoint.lat) / dx;
                let intersectAtLat = lastPoint.lat + ((x - x1) * grad);

                if (intersectAtLat > location.lat)
                    isInside = !isInside;
            }
            lastPoint = point;
        }

        return isInside
    }

    toString(): string {
        return `Polygon[points: GeoLocation[${this.points.length}]]`
    }
}