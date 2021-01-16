// Important page elements should already be loaded by the time this script is run, as well as the leaflet script, so shouldn't need to wait

console.log("Hewwo")

var layer = new L.StamenTileLayer("terrain")
var mymap = L.map('mapid').setView([-26, 136], 4)
mymap.addLayer(layer)
var popup = L.popup()

var point_url = "example_data.json"

var layers_to_filter = {
    Earthquake: [],
    Fire: [],
    Flood: [],
    Cyclone: []
}

fetch(point_url)
    .then(res => res.json())
    .then((out) => {
        // After getting the points, adding them to map
        console.log(out)
        // Not bothering with GeoJSON, just using my own style
        for (point of out) {
            var radius = tweetsToRadius(point.tweets)
            let circle = L.circleMarker(point.coordinates, {
                radius: radius,
                color: "blue"
            })
                .addTo(mymap)
            //circle.bindPopup("Testing")
            let icon = situationToImage(point.situation, radius)
            let marker = L.marker(point.coordinates, {icon: icon}).addTo(mymap)
            marker.bindPopup("Sentiment: " + point.avg_sentiment + "<br>Subjectivity: " + point.avg_subjectivity + "<br>Polarity: " + point.avg_polarity)
            layers_to_filter[point.situation].push(circle)
            layers_to_filter[point.situation].push(marker)
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

function situationToImage(situation, size) {
    // Create an image layer for the map to be attached
    var url = ""
    if (situation === "Earthquake") {
        url = "earthquake.png"
    }
    else if (situation === "Bushfire") {
        url = "fire.png"
    }
    else if (situation === "Flood") {
        url = "flood.png"
    }
    else if (situation === "Cyclone") {
        url = "tornado.png"
    }

    return L.icon({
        iconUrl: url,
        iconSize: [size * 1.5, size * 1.5]
    })
}

function tweetsToRadius(tweets) {
    return tweets / 2
}

function updateFilter(category) {
    if (category in layers_to_filter) {
        // Category exists so filter everything else
        for (set in layers_to_filter) {
            for (item of layers_to_filter[set]) {
                item.remove()
            }
        }
        // After removing everything, adding in only the filtered items
        for (item of layers_to_filter[category]) {
            item.addTo(mymap)
        }
    }
    else {
        // Removing and readding everything to ensure no double up
        for (set in layers_to_filter) {
            for (item of layers_to_filter[set]) {
                item.remove()
                item.addTo(mymap)
            }
        }
    }
}