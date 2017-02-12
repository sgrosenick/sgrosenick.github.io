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

//function to attach popups to each mapped feature
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to create proportional symobls
function createPropSymobls(data, map) {
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//function to retrieve the data and place it on the map
function getData(map) {
    //load the data
    $.ajax("data/MegaCities.geojson", {
        dataType: "json",
        success: function(response){
            //create a leaflet geojson layer
            var geoJsonLayer = L.geoJson(response);
            //create a L.markerClusterGroup layer
            var markers = L.markerClusterGroup();
            //add geojson to marker cluster layer
            markers.addLayer(geoJsonLayer);
            //add marker cluster layer to map
            map.addLayer(markers);
        }
    });
};

$(document).ready(createMap);