//function to initialize the Leaflet map
function createMap() {
    //create the map
    var myMap = L.map('map', {
        center: [20, 0],
        zoom: 2
    });
    
    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom: 22
    }).addTo(myMap);
    
    //call getData function
    getData(myMap);
};

//function to retrieve the data and place it on the map
function getData(map) {
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
            
            //create a Leaflet GeoJSON Layer and add it to the map
            L.geoJSON(response).addTo(map);
        }
    });
};

$(document).ready(createMap);