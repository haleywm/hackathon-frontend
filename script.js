// Important page elements should already be loaded by the time this script is run, as well as the leaflet script, so shouldn't need to wait

console.log("Hewwo")

var layer = new L.StamenTileLayer("terrain")
var mymap = L.map('mapid').setView([-26, 136], 4)
mymap.addLayer(layer)
var popup = L.popup()

var point_url = "example_data.json"

fetch(point_url)
    .then(res => res.json())
    .then((out) => {
        // After getting the points, adding them to map
        console.log(out)
        // Not bothering with GeoJSON, just using my own style
        for (point of out) {
            L.circleMarker(point.coordinates, {
                radius: tweetsToRadius(point.tweets),
                color: "blue"
            })
                .addTo(mymap)
        }
    })

/*
mymap.on("click", (e) => {
    popup
        .setLatLng(e.latlng)
        .setContent("Clicky on " + e.latlng.toString() + " with zoom " + mymap.getZoom())
        .openOn(mymap)
})
*/

function situationToImage(situation) {
    // Create an image layer for the map to be attached
    return 0
}

function tweetsToRadius(tweets) {
    return tweets / 2
}