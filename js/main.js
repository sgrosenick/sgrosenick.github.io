//function to initialize the leaflet map
function createMap() {
    //creates the map
    var myMap = L.map('map', {
        center: [20, 0],
        zoom: 2
    });
    
    //Add OSM basemap
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

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);
    
    return radius;
};

function createPropSymbols(data, map) {
    //determine which attribute to visualize with proportional symbols
    var attribute = "yr2000";
    
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
        pointToLayer: function(feature, latlng) {
            //for each feature, determine its value for the selected attribute
            var attValue = Number(feature.properties[attribute]);
            
            //give each feature's circle marker a radius based on its attribute value
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            
            //create circle marker
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

//Import GEOJSON data
function getData(map) {
    //load the data
    $.ajax("data/oldagedependancy.geojson", {
        dataType: "json",
        success: function(response) {
            //create a leaflet geojson layer
            var geoJsonLayer = L.geoJson(response, {
                onEachFeature: onEachFeature
            });
            //create a L.makerClusterGroup layer
            var markers = L.markerClusterGroup();
            //add geojson to marker cluster layer
            markers.addLayer(geoJsonLayer);
            //add marker cluster to map
            map.addLayer(markers);
            
            //call function to create proportional symbols
            //createPropSymbols(response, map);
        }
    });
};

$(document).ready(createMap);