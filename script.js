// Important page elements should already be loaded by the time this script is run, as well as the leaflet script, so shouldn't need to wait

console.log("Hewwo")

var layer = new L.StamenTileLayer("terrain")
var popup = L.popup()
var mymap = L.map('mapid').setView([-26, 136], 4)
mymap.addLayer(layer)

var point_url = "example_data.json"

fetch(point_url)
    .then(res => res.json())
    .then((out) => {
        // After getting the points, adding them to map
        console.log(out)
        L.geoJSON(out).addTo(mymap)
    })


mymap.on("click", (e) => {
    popup
        .setLatLng(e.latlng)
        .setContent("Clicky on " + e.latlng.toString() + " with zoom " + mymap.getZoom())
        .openOn(mymap)
})