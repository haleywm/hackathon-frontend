// Important page elements should already be loaded by the time this script is run, as well as the leaflet script, so shouldn't need to wait

console.log("Hewwo")

var layer = new L.StamenTileLayer("terrain")
var mymap = L.map('mapid').setView([-26, 136], 4)
mymap.addLayer(layer)
var popup = L.popup()

var point_url = "data.json"

var layers_to_filter = {
    Earthquake: [],
    Bushfire: [],
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
            var radius = tweetsToRadius(point.num_tweets)
            let circle = L.circleMarker(point.coordinates, {
                radius: radius,
                color: sentiToColour(point.avg_sentiment)
            })
                .addTo(mymap)
            //circle.bindPopup("Testing")
            let icon = situationToImage(point.situation, radius)
            let marker = L.marker(point.coordinates, {icon: icon}).addTo(mymap)
            marker.bindPopup(infoString(point.num_tweets, point.situation, point.avg_sentiment))
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
        //iconSize: [10, 10]
    })
}

function tweetsToRadius(tweets) {
    return tweets * 2
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

/******************* */
/*/Added functions
/*******************/
//for outside colour conversion
function outToColour(avg_sentiment) {
    if (avg_sentiment > 0)//if more green
    {
        return 'lime'
    }
    else if (avg_sentiment < 0)//if more red
    {
        return 'red'
    }
    else
    {
        return 'yellow'
    }
}

function sentiToColour(avg_sentiment) {
    //convert sentiment to a colour between red and green rgb values
    //sentiment is a number between 1 and -1
    //1 is red, -1 is green
    //red = #FF0000, green = 00FF00
    var red = 255
    var green = 255
    if (avg_sentiment < 0)//if more green
    {
        green = Math.trunc(255 / 100) * (100+(avg_sentiment*100))
    }
    else if (avg_sentiment > 0)//if more red
    {
        red = Math.trunc(255 / 100) * (100-avg_sentiment*100)
    }
    
    var color = rgbToHex(red, green, 0)
    console.log(color)
    return color
}

//convert rgb to hex
function oneHex(h) //convert individual rgb to hex
{
    var hex = h.toString(16).slice(0, 2);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r,g,b) {
    return '#' + oneHex(r) + oneHex(g) + oneHex(b); 
}
 
//create circle function
function createCirc(x,y,sent,radius)
{
    var circle = L.circle([x, y], {
        color: outToColour(sent),
        fillColor: sentiToColour(sent),
        fillOpacity: 0.6,
        radius: radius
    })
    return circle
}
//return string of info
function infoString(tweets, situ, sent)
{
    return "Tweets: " + tweets + "\n" +
    "<br>Situation: " + situ + "\n" +
    "<br>Average Sentiment: " + sent + "\n"
}