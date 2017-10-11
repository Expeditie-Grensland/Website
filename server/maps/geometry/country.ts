import {Polygon} from "./polygon"
import {GeoLocation} from "./geolocation"
import {SVGPath} from "./svgpath"

export class Country extends Polygon {

    constructor(public readonly name: string, public readonly svgPath: SVGPath, points: GeoLocation[]) {
        super(points)
    }

    toString() {
        return `Country[name: ${this.name}, points: ${super.toString()}, svgPath: ${this.svgPath.toString()}]`
    }
}