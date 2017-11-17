declare var MapboxLanguage:any

$(document).ready(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw'
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mauricemeedendorp/cj9zhseph8lev2rqd3f6vsmkj',
        center: [5.843570, 52.268337],
        zoom: 6,
    });
    mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js', () => {});

    map.addControl(new mapboxgl.NavigationControl());

    map.on('style.load', () => {
        console.log("Map style loaded!")

        const mapLanguage = new MapboxLanguage();
        const browserLanguage = (navigator.languages ? navigator.languages[0] : navigator.language).split('-')[0]

        //There's a bug in MapboxLanguage that chrashes if the browser language is a non-supported language.
        if(!mapLanguage.supportedLanguages.includes(browserLanguage)) {
            mapLanguage._defaultLanguage = "en"

            console.log("Browser language not supported by mapbox. Switching to English.")
        }

        map.addControl(mapLanguage);
    })

    map.on('ready', () => {
        console.log("Map ready!")

        SocketHandler.init()
    })
})