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

//Create new slider sequence controls
function createSequenceControls(map, attributes) {
    //create range input element (slider)
    $('#panel').append('<input class="range-slider" type="range">');
    
    //set slider attributes
    $('.range-slider').attr({
        max: 13,
        min: 0,
        value: 0,
        step: 1
    });
    
    $('#panel').append('<button class="skip" id="reverse">Reverse</button>');
    $('#panel').append('<button class="skip" id="forward">Skip</button>');
    
    //click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        
        //increment or decrement depending on button choice
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to the first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if at the first attribute, wrap around to the last attribute
            index = index < 0 ? 6 : index;
        };
        
        //update slider
        $('.range-slider').val(index);
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
    
    //input listener for slider
    $('.range-slider').on('input', function(){
        //get new index value
        var index = $(this).val();
        
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
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

//build an attributes array from the data
function processData(data) {
    //empty array to hold attribution
    var attributes = [];
    
    //properties of the first feature in the dataset
    var properties = data.features[0].properties;
    
    //push each attribute name into attribute array
    for (var attribute in properties) {
        //only take attributes with year values
        if (attribute.indexOf("yr") > -1) {
            attributes.push(attribute);
        };
    };
    
    //check result
    console.log(attributes);
    
    return attributes;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes) {
    //assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    
    //check
    console.log(attribute);
    
    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    
    //for each feature, determine its value for the selected feature
    var attValue = Number(feature.properties[attribute]);
    
    //give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);
    
    //create circle maker layer
    var layer = L.circleMarker(latlng, options);
    
    //build popup content string
    var popupContent = "<p><b>City:</b> " +feature.properties.city + "</p><p><b>" + attribute + ": </b>" + feature.properties[attribute] + "%</p>";
    
    //bind the popup to the circle maker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });
    
    //event listeners to open popup on hover
    layer.on({
        mouseover: function() {
            this.openPopup();
        },
        mouseout: function() {
            this.closePopup();
        },
        click: function() {
            $("#panel").html(popupContent);
        }
    });
    
    //return the circle maker to the L.geoJson pointToLayer option
    return layer;
};

function createPropSymbols(data, map, attributes) {
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function updatePropSymbols(map, attribute) {
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            
            //update each feature's radius based on new attributes values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            
            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.city + "</p>";
            
            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population in " + year + ":</b>" + props[attribute] + " million</p>";
            
            //replace tthe layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0, -radius)
            });
        };
    });
};

//Import GEOJSON data
function getData(map) {
    //load the data
    $.ajax("data/oldagedependancy.geojson", {
        dataType: "json",
        success: function(response) {
            //create an attributes array
            var attributes = processData(response);
            
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            //create slider
            createSequenceControls(map, attributes);
        }
    });
};

$(document).ready(createMap);       