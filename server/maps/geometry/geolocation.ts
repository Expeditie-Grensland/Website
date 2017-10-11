export class GeoLocation {
    constructor(public readonly lat: number, public readonly lon: number) {}

    toString(): string {
        return `GeoLocation[lat: ${this.lat}, lon: ${this.lon}]`
    }
}