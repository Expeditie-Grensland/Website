import mapboxgl, {FeatureIdentifier, GeoJSONSource} from "mapbox-gl"
import {ToggleLayerControl} from "./ToggleLayerControl"
import $ from "jquery"
import {GeoJsonResult, StoryResult} from "../helpers/retrieval"
import {Feature, Point} from "geojson"
import {StoryHandler} from "../story/StoryHandler"


export class MapHandler {

    public map = new mapboxgl.Map({
        container: 'map',
        projection: {
            name: 'globe'
        },
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [7.048, 53.0545],
        zoom: 2,
        antialias: true
    });
    private latLngBounds: mapboxgl.LngLatBounds | null = null

    private hasStory: boolean

    private nodeColors: string[]

    private hoveringFeatureId: string | null = null

    public cameraPadding: mapboxgl.CameraOptions['padding'];

    constructor(hasStory: boolean, nodeColors: string[]) {
        this.hasStory = hasStory;
        this.nodeColors = nodeColors;
        this.cameraPadding = {
            top: 20,
            bottom: 20,
            left: this.hasStory ? $(window).width()! * 0.3 : 20,
            right: 20
        };
        this.initControls();

        this.map.on('load', this.onMapLoad);
        this.map.on('error', (e: any) => {
            console.error('Map error: ' + e.error);
        });
    }

    private storyHandler: StoryHandler | null = null

    public setStoryHandler = (handler: StoryHandler) => {
        this.storyHandler = handler;
    }

    private initControls = () => {
        this.map.addControl(new mapboxgl.NavigationControl());
        this.map.addControl(new mapboxgl.ScaleControl());
        this.map.addControl(new ToggleLayerControl('satellite'));
    }

    private onMapLoad = () => {
        this.add3DBuildings();
        this.add3DTerrain();
        this.addSatellite();
    }

    private add3DBuildings = () => {
        // Insert the 3d building layer beneath any symbol layer.
        const layers = this.map.getStyle().layers;
        const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout!['text-field']
        )!.id;

        // The 'building' layer in the Mapbox Streets
        // vector tileset contains building height data
        // from OpenStreetMap.
        this.map.addLayer(
            {
                'id': 'add-3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',

                    // Use an 'interpolate' expression to
                    // add a smooth transition effect to
                    // the buildings as the user zooms in.
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'height']
                    ],
                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        15,
                        0,
                        15.05,
                        ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 0.6
                }
            },
            labelLayerId
        );
    }

    private add3DTerrain = () => {
        this.map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
        });
        // add the DEM source as a terrain layer with exaggerated height
        this.map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.25 });

        // add a star/fog layer for when zooming out or pitching map
        this.map.setFog({
            color: 'rgb(186, 210, 235)', // Lower atmosphere
            'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        });

        // Add hillshade layer
        this.map.addLayer({
                'id': 'hillshading',
                'source': 'mapbox-dem',
                'type': 'hillshade',
                'paint': {
                    'hillshade-exaggeration': .2
                }
            },
            // insert before waterway-river-canal-shadow;
            // where hillshading sits in the Mapbox outdoors style
            'land-structure-polygon'
        );
    }

    private addSatellite = () => {
        // Add satellite layer
        this.map.addLayer({
            id: 'satellite',
            source: {
                "type": "raster",
                "url": "mapbox://mapbox.satellite",
                "tileSize": 512
            },
            'layout': {
                // Make the layer invisible by default.
                'visibility': 'none'
            },
            type: "raster"
        }, 'tunnel-street-low');
    }

    public addStoryLayer = (res: StoryResult) => {
        this.map.addSource('story-points', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: res.story.map(story => {
                    return ({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [story.longitude, story.latitude]
                        },
                        properties: {
                            title: story.type === "location" ? story.name : story.title,
                            nodeNum: story.nodeNum,
                            storyId: story.id,
                        },
                    })
                })
            },
            promoteId: 'storyId',
            // https://docs.mapbox.com/mapbox-gl-js/example/cluster/
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 10 // Radius of each cluster when clustering points (defaults to 50)
        });

        // Visualize unclustered points
        this.map.addLayer({
            id: 'story-points',
            type: 'circle',
            source: 'story-points',
            filter: ['!', ['has', 'point_count']],      // only render unclustered points with this layer.
            paint: {
                'circle-radius': [  // interpolate circle radius based on zoom level
                    'interpolate',
                    ['exponential', 1],
                    ['zoom'],
                    3, [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        5,
                        3,
                    ],
                    20, [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        10,
                        7,
                    ]
                ],
                'circle-stroke-width': [  // interpolate circle radius based on zoom level
                    'interpolate',
                    ['exponential', 1],
                    ['zoom'],
                    3, 2,
                    20, 5
                ],
                'circle-pitch-alignment': 'map',
                'circle-color': '#ffffff',
                'circle-stroke-color': [
                    'match',
                    ['get', 'nodeNum'],
                    0, this.nodeColors[0],
                    1, this.nodeColors[1],
                    2, this.nodeColors[2],
                    3, this.nodeColors[3],
                    4, this.nodeColors[4],
                    5, this.nodeColors[5],
                    6, this.nodeColors[6],
                    7, this.nodeColors[7],
                    8, this.nodeColors[8],
                    '#000'
                ]
            },
        });

        // Visualize clustered points
        this.map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'story-points',
            filter: ['has', 'point_count'],
            paint: {
                'circle-radius': [  // interpolate circle radius based on zoom level
                    'interpolate',
                    ['exponential', 1],
                    ['zoom'],
                    3, [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        8,
                        6,
                    ],
                    20, [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        13,
                        11,
                    ]
                ],
                'circle-stroke-width': [  // interpolate circle radius based on zoom level
                    'interpolate',
                    ['exponential', 1],
                    ['zoom'],
                    3, 3,
                    20, 6
                ],
                'circle-pitch-alignment': 'map',
                'circle-color': '#ffffff',
                'circle-stroke-color': '#000'
            }
        });

        // Visualize cluster count
        this.map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'story-points',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });


        // inspect a cluster on click
        this.map.on('click', 'clusters', (e) => {
            const features = this.map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            }) as Feature<Point>[];

            // Check whether features exist
            if (!features
                || features.length === 0
                || features[0].properties == null
                || features[0].properties.cluster_id == null
                || features[0].geometry.type != 'Point')
                return;

            const clusterId = features[0].properties.cluster_id;
            (this.map.getSource('story-points') as GeoJSONSource).getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;
                    const coords = features[0].geometry.coordinates

                    this.map.easeTo({
                        center: [coords[0], coords[1]],
                        zoom: zoom,
                        padding: this.cameraPadding
                    });
                }
            );
        });

        // Change the cursor to a pointer when it enters a feature in the cluster layer.
        this.map.on('mouseenter', 'clusters', () => {
            this.map.getCanvas().style.cursor = 'pointer';
        })

        // Change it back to a pointer when it leaves.
        this.map.on('mouseleave', 'clusters', () => {
            this.map.getCanvas().style.cursor = '';
        });

            // Center the map on the coordinates of any clicked circle from the 'circle' layer.
        this.map.on('click', 'story-points', (e) => {
            const coords = (e.features![0].geometry as Point).coordinates

            this.map.flyTo({
                center: [coords[0], coords[1]],
                zoom: 13,
                padding: this.cameraPadding
            });
        });


        // Change the cursor to a pointer when it enters a feature in the 'circle' layer.
        this.map.on('mousemove', 'story-points', (event) => {
            this.map.getCanvas().style.cursor = 'pointer';

            const features = event.features;

            // Check whether features exist
            if (!features || features.length === 0 || features[0].id == null) return;

            const id = features[0].id as string;

            this.setHoveringFeature(id);
            this.storyHandler?.setHoveringStory(id);
        });

        // Change it back to a pointer when it leaves.
        this.map.on('mouseleave', 'story-points', () => {
            this.map.getCanvas().style.cursor = '';

            this.resetHoveringFeature();
            this.storyHandler?.resetHoveringStory();
        });
    }

    public resetHoveringFeature = () => {
        if (this.hoveringFeatureId != null) {
            this.map.setFeatureState({source: 'story-points', id: this.hoveringFeatureId}, {hover: false});
            this.hoveringFeatureId = null;
        }
    }

    public setHoveringFeature = (featureId: string) => {
        if (this.hoveringFeatureId === featureId)
            return;

        this.resetHoveringFeature();
        // set feature state to increase circle size on hover
        this.hoveringFeatureId = featureId;
        this.map.setFeatureState({source: 'story-points', id: this.hoveringFeatureId}, {hover: true});
    }

    public resetBounds = () => {
        if (this.latLngBounds == null)
            return

        this.map.fitBounds(this.latLngBounds, {
            padding: this.cameraPadding,
            animate: true
        });
    }

    public addExpeditieRoute = (res: GeoJsonResult) => {
        this.latLngBounds = new mapboxgl.LngLatBounds(
            new mapboxgl.LngLat(res.minLon, res.minLat),
            new mapboxgl.LngLat(res.maxLon, res.maxLat)
        );

        this.map.addSource('exp-route', { type: 'geojson', data: res.geoJson } as any);

        this.map.addLayer({
            id: 'exp-route',
            type: 'line',
            source: 'exp-route',
            paint: {
                'line-opacity': 1,
                'line-width': 3,
                'line-color': [
                    'match',
                    ['get', 'nodeNum'],
                    0, this.nodeColors[0],
                    1, this.nodeColors[1],
                    2, this.nodeColors[2],
                    3, this.nodeColors[3],
                    4, this.nodeColors[4],
                    5, this.nodeColors[5],
                    6, this.nodeColors[6],
                    7, this.nodeColors[7],
                    8, this.nodeColors[8],
                    '#000'
                ]
            }
        });

        this.resetBounds();
    }
}

