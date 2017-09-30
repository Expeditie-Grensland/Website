var Leaflet;
(function (Leaflet) {
    function init() {
        var mymap = L.map('mapid').setView([51.505, -0.09], 13);
    }
    Leaflet.init = init;
})(Leaflet || (Leaflet = {}));
