namespace MapHome {
    export function init() {

        // const mapBaseLayer = L.tileLayer(
        //     "https://api.mapbox.com/styles/v1/mauricemeedendorp/cj875zftv39ov2rqiix3hbigz/tiles/256/{z}/{x}/{y}?access_token={access_token}",
        //     {
        //         attribution:  "© <a href=\"https://www.mapbox.com/feedback/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
        //         access_token: "pk.eyJ1IjoibWF1cmljZW1lZWRlbmRvcnAiLCJhIjoiY2o4NzV5amh5MTVidzJxcWhlbDNhMWlmOCJ9.DvTrMNuuFX3QZZ3boymWPw"
        //     }
        // )


        const map = L.map('mapid').setView([40, 0], 3)
        const homecountry: string = 'Netherlands'
        const countriesBeen: string[] = ['Germany', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Finland', 'Sweden', 'Norway', 'Denmark']

        $.ajax({
            dataType: "json",
            url: "/data/countries.geojson",
            success: function(data) {
                L.geoJSON(data, {
                    style: function(feature) {
                        if(homecountry == feature.properties.name) {
                            return {color: '#ffee00'}
                        } else if(countriesBeen.some(x => x == feature.properties.name)) {
                            return {color: '#AABBCC'}
                        } else {
                            return {color: '#01aaff'}
                        }
                    }
                    }).addTo(map);
                console.log("GeoJSON loaded!")
            },
            error: function(xhr, ajaxOptions, thrownError) {
                console.log("Error: " + thrownError)
            }
        });
    }
}
MapHome.init()