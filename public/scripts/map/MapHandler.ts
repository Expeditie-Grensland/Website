namespace MapHandler {
    export let map: mapboxgl.Map = null

    let route: Tables.Route = null
    const nodeMap: Map<string, Tables.RouteNode> = new Map()
    const locationMap: Map<string, Tables.Location> = new Map()
    const locationNodeMap: Map<string, Tables.Location[]> = new Map() //Map RouteNode ids to location

    let mapStyleLoaded = false

    export function init(mapboxMap: mapboxgl.Map) {
        map = mapboxMap

        map.on('load', onMapStyleLoad)

        SocketHandler.requestRoute(expeditieNameShort)
    }

    export function setRoute(r: Tables.Route) {
        route = r
    }

    export function addNodes(nodes: Tables.RouteNode[]) {
        nodes.forEach(node => nodeMap.set(node._id, node))

        for(let node of nodes) {
            locationNodeMap.set(node._id, [])

            map.addLayer({
                id: node._id,
                type: "line",
                source: "route",
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
        locations.forEach(location => locationMap.set(location._id, location))

        for(let location of locations) {
            const nodeLocations = locationNodeMap.get(<string>location.node)

            nodeLocations.push(location)

            locationNodeMap.set(<string>location.node, nodeLocations)
        }

        if(mapStyleLoaded)
            updateMap(false)
    }

    export function updateMap(updateViewport: boolean) {
        const locationsGeoJSON = locationsToGeoJSON();
        const coords = locationsGeoJSON.features.reduce((array, feature) => array.concat(feature.geometry.coordinates), []);

        console.log(locationsGeoJSON);

        (<mapboxgl.GeoJSONSource>map.getSource('route')).setData(locationsGeoJSON)

        if(updateViewport) {
            const bounds = coords.reduce((bounds, coords) => bounds.extend(coords), new mapboxgl.LngLatBounds(coords[0], coords[0]))

            map.fitBounds(bounds, {
                padding: 20
            });
        }
    }

    export function locationsToGeoJSON(): any {
        const features = []

        for(let node of nodeMap.values()) {
            const coords: mapboxgl.LngLat[] = []

            for(let location of locationNodeMap.get(node._id).sort((l1, l2) => l1.timestamp - l2.timestamp)) {
                coords.push(new mapboxgl.LngLat(location.lon, location.lat))
            }

            if(coords.length >= 2) {
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

        updateMap(true)
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