import {Polygon} from "./geometry/polygon"
import {GeoLocation} from "./geometry/geolocation"
import {None, Option, Some} from "tsoption"
import {Country} from "./geometry/country"
import {SVGPath} from "./geometry/svgpath"

namespace Countries {
    import RootObject = namespace.RootObject
    export const worldJSON = require('./data/world.geo.json')          //Officially recognized countries of the world
    export const disputedJSON = require('./data/disputed.geo.json')    //Disputed areas

    /**
     * All disputed areas
     */
    let disputed: Option<Country[]>
    /**
     * All officially recognized countries
     */
    let officialCountries: Option<Country[]>
    /**
     * Both disputed areas and countries in one array
     */
    let allCountries: Option<Country[]>

    /**
     * Returns the country the provided location is in, or None if it is not in a country.
     * @param countries
     * @param {GeoLocation} location
     * @returns {Option<string>} The name of the country the point is in.
     */
    export function getCountry(countries: Country[], location: GeoLocation): Option<string> {
        return Option.from(
            countries.find(country => country.contains(location))
        ).map(country => country.name)
    }

    export function getOfficialCountries(): Country[] {
        if(officialCountries.isEmpty())
            officialCountries = Some(readGeoJSON(worldJSON))
        return officialCountries.get()
    }

    export function getDisputedAreas(): Country[] {
        if(disputed.isEmpty())
            disputed = Some(readGeoJSON(disputedJSON as RootObject))
        return disputed.get()
    }

    export function getAllCountries(): Country[] {
        if(allCountries.isEmpty())
            allCountries = Some(getOfficialCountries().concat(getDisputedAreas()))
        return allCountries.get()
    }

    export function readDisputedCountries(): Country[] {
        json = require()

        json.features.map(feature => new Country(feature.properties.BRK_NAME, new SVGPath(""), feature.geometry.))



        return
    }
}