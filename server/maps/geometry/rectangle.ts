import {GeoLocation} from "./geolocation"

export class Rectangle {
    constructor(public readonly point1: GeoLocation, public readonly  point2: GeoLocation) {}

    contains(point: GeoLocation) {
        function numberBetween(i: number, n1: number, n2: number): Boolean {
            return (n1 <= i && i <= n2) || (n2 <= i && i <= n1)
        }

        return numberBetween(point.lat, this.point1.lat, this.point2.lat)
            && numberBetween(point.lon, this.point1.lon, this.point2.lon)
    }

    toString(): string {
        return `Rectangle[point1: ${this.point1.toString()}, point2: ${this.point2.toString()}]`
    }
}