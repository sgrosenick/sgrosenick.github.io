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

function createSequenceControls(map, attributes) {
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        
        onAdd: function (map) {
            // create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
            
            //create a title for the scale farctor bar
            $(container).append('<div id="scale-title">Change Scale Factor</div>');
            
            //create a slider bar to change the scale factor of the symbols
            $(container).append('<input class="scale-factor" type="range">');
            
            //add scale buttons
            $(container).append('<button class="scale-button" id="smaller" title="Smaller">Smaller</button>');
            $(container).append('<button class="scale-button" id="larger" title="Larger">Larger</button>');
            
            //$(container).append('<button class="resymbol" id="alter" title="alter">Change Style</button>');
            
            //create title for the slider that changes attribute
            $(container).append('<div id="sequence-title">Change Year</div>')
            
            //create range input element
            $(container).append('<input class="range-slider" type="range">');
            
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
            
            $(container).on('mousedown dblclick', function(e){
                L.DomEvent.stopPropagation(e);
            });
            
            return container;
        }
    });
    
    map.addControl(new SequenceControl());
    
    //set attributes for scale slider
    $('.scale-factor').attr({
        max: 4,
        min: 0,
        value: 0,
        step: 1
    });
    
    //set listener for scale slider buttons
    $('.scale-button').click(function(){
        //get the current scale factor value
        var scaleindex = $('.scale-factor').val();
        
        //get the old index value
        var index = $('.range-slider').val();
        
        //increment or decrement
        if ($(this).attr('id') == 'smaller'){
            scaleindex--;
            //no setting to go 5 if already at 1
            scaleindex = scaleindex < 0 ? 4 : scaleindex;
        } else if ($(this).attr('id') == 'larger'){
            scaleindex++;
            //no setting to skip back to 1
            scaleindex = scaleindex > 4 ? 0 : scaleindex;
        };
        
        
        //update slider
        $('.scale-factor').val(scaleindex);
        //pass the year selected on the 'Change Year' slide bar
        updatePropSymbolsScale(map, attributes[index]);
    });
    
    $('.scale-factor').on('input', function(){
        //get new index value
        var scaleindex = $(this).val();
        
        //pass new attribute to update symobl
        updatePropSymbolsScale(map, attributes[index]);
    });
    
    //set attribute slider attributes
    $('.range-slider').attr({
        max: 14,
        min: 0,
        value: 0,
        step: 1
    });
    
    //click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        
        //increment or decrement depending on button choice
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to the first attribute
            index = index > 14 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //if at the first attribute, wrap around to the last attribute
            index = index < 0 ? 14 : index;
        };
        
        //update slider
        $('.range-slider').val(index);
        //pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
    
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

function calcPropRadiusScale(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 50;
    
    //retrieves the value of the scale index slider
    var scaleindex = $('.scale-factor').val();
    
    //changes the scale factor based on what the scale factor slider was set at
    scaleFactor = 25 + attValue + (scaleindex * 20);
    
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
        fillColor: "#4CCC6A",
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
    
    var popup = new Popup(feature.properties, attribute, layer, options.radius);
    
    popup.bindToLayer();
    
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

function Popup(properties, attribute, layer, radius){
    this.properties = properties;
    this.attribute = attribute;
    this.layer = layer;
    this.year = attribute.split("_")[1];
    this.percentage = this.properties[attribute];
    this.content = "<p><b>City:</b> " + this.properties.city + "</p><p><b>Population over 65 in " + this.year + ":</b> " + this.percentage + "%</p>";
    
    this.bindToLayer = function(){
        this.layer.bindPopup(this.content, {
            offset: new L.Point(0, -radius)
        });
    };
};

function updateLegend(map, attribute) {
    //create content for legend
    var year = attribute.split("_")[1];
    var content = "Percent Pop. over 65 in " + year;
    
    //replace legend content
    $('#temporal-legend').html(content);
    
    //get the max, mean, and min values as an object
    var circleValues = getCircleValues(map, attribute);
    
    console.log(circleValues);
    
    for (var key in circleValues) {
        //get the radius
        var radius = calcPropRadius(circleValues[key]);
        
        //console.log(key);
        console.log(radius);
        
        //assign the cy and r attributes
        $('#'+key).attr({
            cy: 85 - radius,
            r: radius
        });
        
        //add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + "%");
    };
};

function createLegend(map, attributes) {
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },
        
        onAdd: function (map) {
            //create the control conatainer witha particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            
            //Add title to legend
            $(container).append('<div id="legend-title">Elderly Populations</div>')
            
            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">');
            
            //start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="120px">';
            
            //array of circle names to base loop on
            var circles = {
                max: 40,
                mean: 60,
                min: 80
            };
            
            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#4CCC6A" fill-opacity="0.8" stroke="#000000" cx="30"/>';
                
                //text string
                svg += '<text id="' + circle + '-text" x="85" y="' + circles[circle] + '"></text>';
            };
            
            //close svg string
            svg += "</svg>";
            
            //add attribute legend svg to container
            $(container).append(svg);
            
            return container;
        }
    });
    
    map.addControl(new LegendControl());
    
    updateLegend(map, attributes[0]);
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
            
            var popup = new Popup(props, attribute, layer, radius);
            
            popup.bindToLayer();    
        };
    
    });
    updateLegend(map, attribute);
};

function updatePropSymbolsScale(map, attribute) {
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            
            //update each feature's radius based on new attributes values
            var radius = calcPropRadiusScale(props[attribute]);
            layer.setRadius(radius);
            
            //add city to popup content string
            var popupContent = "<p><b>City:</b> " + props.city + "</p>";
            
            //add formatted attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b>Population over 65 in " + year + ": </b>" + props[attribute] + "%</p>";
            
            //replace tthe layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0, -radius)
            });
            
        };
    
    });
};

function getCircleValues(map, attribute) {
    //start with min at heighest possible and max at lowest possible
    var min = Infinity,
        max = -Infinity;
    
    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);
            
            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };
            
            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });
    
    //set mean
    var mean = (max + min) / 2;
    
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
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
            //create legend
            createLegend(map, attributes);
        }
    });
};

$(document).ready(createMap);       