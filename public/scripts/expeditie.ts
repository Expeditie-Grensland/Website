declare var MapboxLanguage:any

$(document).ready(() => {
    const map = new mapboxgl.Map({
        container: 'map',
        //style: 'https://github.com/openmaptiles/klokantech-terrain-gl-style/raw/master/style.json',
        style: 'https://openmaptiles.github.io/klokantech-terrain-gl-style/style-cdn.json',
        center: [5.843570, 52.268337],
        zoom: 6,
    });
    mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js', () => {});

    map.on('style.load', () => {
        console.log("Map style loaded!")

        map.setLayoutProperty('country_label-en', 'text-field', '{name:ar}');
        map.setLayoutProperty('poi_label-en', 'text-field', '{name:ar}');
        map.setLayoutProperty('road_major_label-en', 'text-field', '{name:ar}');
        map.setLayoutProperty('place_label_other-en', 'text-field', '{name:ar}');
        map.setLayoutProperty('place_label_city-en', 'text-field', '{name:ar}');
    })
})