namespace MapHandler {
    const LOCATION_SOURCE = "locations"

    export let map: mapboxgl.Map = null

    let route: Tables.Route = null
    const nodeMap: Map<string, Tables.RouteNode> = new Map()
    const locationMap: Map<string, Tables.Location> = new Map()
    const locationNodeMap: Map<string, string[]> = new Map() //Map RouteNode ids to location ids.

    let mapStyleLoaded = false

    export function init(mapboxMap: mapboxgl.Map) {
        map = mapboxMap

        map.on('style.load', onMapStyleLoad)

        SocketHandler.requestRoute(expeditieNameShort)
    }

    export function setRoute(r: Tables.Route) {
        route = r

        setViewportToBoundingBox(r.boundingBox)
    }

    export function addNodes(nodes: Tables.RouteNode[]) {
        for (let node of nodes) {
            nodeMap.set(node._id, node)

            locationNodeMap.set(node._id, [])

            //TODO make this one layer instead of multiple. https://www.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
            map.addLayer({
                id: LOCATION_SOURCE + node._id,
                type: "line",
                source: LOCATION_SOURCE,
                paint: {
                    "line-color": node.color,
                    "line-opacity": 1,
                    "line-width": 3
                },
                filter: ["==", "node-id", node._id]
            })
        }
    }

    export function addLocations(locations: Tables.Location[]) {
        for (let location of locations) {
            const nodeLocations = locationNodeMap.get(<string>location.node)

            nodeLocations.push(location._id)

            locationMap.set(location._id, location)
            locationNodeMap.set(<string>location.node, nodeLocations)
        }

        if (mapStyleLoaded)
            updateMap()
    }

    export function updateMap() {
        const locationSource = map.getSource(LOCATION_SOURCE) as mapboxgl.GeoJSONSource

        const locationsGeoJSON = generateLocationsGeoJSON()

        locationSource.setData(locationsGeoJSON)
    }

    export function setViewportToBoundingBox(bbox: Tables.RouteBoundingBox) {
        const bounds = new mapboxgl.LngLatBounds()

        bounds.extend(new mapboxgl.LngLat(bbox.minLon, bbox.minLat))
        bounds.extend(new mapboxgl.LngLat(bbox.maxLon, bbox.maxLat))

        map.fitBounds(bounds, {
            padding: 20
        })
    }

    export function generateLocationsGeoJSON(): GeoJSON.FeatureCollection<GeoJSON.LineString> {
        const features: GeoJSON.Feature<GeoJSON.LineString>[] = []

        for (let node of nodeMap.values()) {
            const coords: mapboxgl.LngLat[] = []
            const nodeLocations = locationNodeMap.get(node._id).map(l => getLocation(l)).sort((l1, l2) => l1.timestamp - l2.timestamp)

            for (let location of nodeLocations) {
                coords.push(new mapboxgl.LngLat(location.lon, location.lat))
            }

            if (coords.length >= 2) {
                features.push({
                    type: "Feature",
                    properties: {
                        "node-id": node._id,
                    },
                    geometry: {
                        type: "LineString",
                        coordinates: coords.map(coord => [coord.lng, coord.lat])
                    }
                })
            }
        }

        return {
            type: "FeatureCollection",
            features: features,
        }
    }

    export function onMapStyleLoad() {
        mapStyleLoaded = true

        map.addSource(LOCATION_SOURCE, {type: 'geojson', data: null})

        updateMap()
    }

    export function getRoute() {
        return route
    }

    export function getNode(_id: string) {
        return nodeMap.get(_id)
    }

    export function getLocation(_id: string) {
        return locationMap.get(_id)
    }
}
