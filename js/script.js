var obj = {};
// New break tag to be used wherever as needed
var br = $("<br>");

// "MAP IT" BUTTON CREATIONS/FUNCTIONALITY 
function addMapBtn(park, targetDiv, parkName) {
    var button = $("<button>");
    // Initializes latitude and longitude variables for the jQuery construction        
    var parkLat = ""
    var parkLong = ""
   
    if (park.latLong) {
        // Variable that is an array with the latitude and longitude, reassigns previous variables to equal the API information                        
        var firstSplit = park.latLong.split(", ")
        parkLat = firstSplit[0].replace("lat:", "")
        parkLong = firstSplit[1].replace("long:", "")
        // Use jQuery to create a button for the user to view and specific park on the map
        // button.attr("data-lat", parkLat).attr("data-long", parkLong).attr("data-name", parkName).attr("class", "button success large view-on-map").attr("role", "button");
        // Add text to the button
        // button.text("Map it")
        // Appends and button to the target div        
        $(targetDiv).append(button).append(br)
    }      
}

// Function to add marker for the park to the map
var addMarker = function(e) {
    var mapDiv = $("<div>")
    // remove the initial map
    map.remove()
    // define parkLat, parkLong, and parkName values
    var parkLat = e.target.attributes[0].nodeValue
    var parkLong = e.target.attributes[1].nodeValue
    var parkName = e.target.attributes[2].nodeValue
    // make a new map div and latch it onto the #map-home div in the HTML
    mapDiv.attr("id", "map")
    $("#map-home").append(mapDiv)
    // build a new map using the parkLat, parkLong, and parkName variables
    loadMap(parkLat, parkLong, parkName)
}

// add marker with View on Map button is clicked
$("body").on("click", ".view-on-map", addMarker) 

// Function to run AJAX call to NPS.gov and gather the park data
var displayParks = function(ST) {
    var stateCode = ST
    var apiKey = "hwP8B0f6Uwf5jW8g2PwCYkYhjnPHthmbcKhAlx4H"
    var queryURL = "https://api.nps.gov/api/v1/parks?stateCode=" +stateCode  + "&api_key=" + apiKey
    // AJAX request to get info from NPS API
    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function(response) {
        console.log(response)
        // add the response data to the temporary object "obj"
        obj.parks = response.data
        // run the createTable function
        createTable()   
    })
}

// GET WEATHER DATA FROM OpenWeatherMaps API
function getWeather(lat, lon, targetDiv) {
    var weatherKey = "c1a8441894f24baaa155fb383073ff34";
    var weatherQuery = "https://api.openweathermap.org/data/2.5/weather?units=imperial&lat=" + lat + "&lon=" + lon + "&appid=" + weatherKey;
    
    $.ajax({
        url: weatherQuery,
        method: "GET"
    }).then(function(w) {
         var iconcode = w.weather[0].icon;
         var iconURL = "http://openweathermap.org/img/w/" + iconcode + ".png";
        
        $(targetDiv).prepend($("<img>").attr("src", iconURL));
        $(targetDiv).prepend("<br><h5 class='text-center'> Current Temp (F) in " + w.name + " is:  <strong>" + w.main.temp + " F</strong>")

    })
}

// Function to populate the table beneath the map with park data for the selected state
function createTable() {
    for (var i = 0; i < obj.parks.length; i++) {
        // variables to create new HTML elements in the DOM
        var newRow = $("<tr class='text-center' style='background-color: #16bccd; text-align: center;'>");
        var newTd = $("<td>")
        var targetDiv = $("<div class ='row medium-collapse large-uncollapse'>")
        var newBtn = $("<button role='button'>")
        var newColumn = $("<th 'small-6 columns' >")
        var newColumn2 = $("<th 'small-4 columns'>")
        var newColumn3 = $("<th  'small-3 columns'>")
      
        // variables to define the park data pulled from temporary object "obj"
        var park = obj.parks[i]
        var parkImage;
        var parkDescription = park.description
        var parkDirectionsURL = park.directionsUrl
        console.log(parkDirectionsURL);
        var parkDesignation = park.designation

        var parkName = park.fullName
        var parkCode = park.parkCode
        var parkState = park.states
       
        // if loop to separate pLat and pLong when it exists
        if (park.latLong) {                      
            var fSplit = park.latLong.split(", ")
            pLat = fSplit[0].replace("lat:", "")
            pLong = fSplit[1].replace("long:", "")
            getWeather(pLat, pLong, targetDiv)
        } else {
            console.log("Weather information for this park is currently unavailable")
        }
        // Create a new table row for each park in the API response array
        newRow.addClass("clickable").attr("data-toggle", "medium-collapse large-uncollapse");
        // add new row and table data to the targetDiv and append to the div with the table-body ID
        $("#table-body").append(newRow).append(newTd).append(targetDiv)
        if (park.images.length > 0 ) {
            parkImage = park.images[0].url
            $(targetDiv).append(newTd).append("<img class='park-image' src='" + parkImage + "'>")
        } else {
            $(targetDiv).append(newTd).append("<img class='park-image' src='./images/Image-Unavailable.jpg'>")
        }

        $(newColumn).append(parkName)
        $(newColumn2).append(parkDesignation)
        $(newColumn3).append(parkState)
        $(newRow).append(newColumn).append(newColumn2).append(newColumn3)
    
        $(newRow).attr("data-target","#"+ parkCode) 
        // Add park description to the collapsible targetDiv element
        $(targetDiv).append("<div id='park-description'><h5>Description: </h5><p>" + parkDescription + "</p></div>")
        
        // Add 'Get Directions' button to the same targetDiv and have it open the directions in a new tab
        $(newBtn).append("<a href='" + parkDirectionsURL + "' target='_blank' class='directions button secondary large'>Get Directions</a>")
        $(targetDiv).append(newBtn)
        // add the parkCode as the targetDiv's ID
        $(targetDiv).attr("id", parkCode)
        // call the addMapBtn that plots the marker on the new map
        addMapBtn(park, targetDiv, parkName)
    }
}


// Function for initializing leaflet map based on lat, long into the #map div
var loadMap = function(lat, long, name) {
    L.mapquest.key = 'LfJhHzUK3ofh6iGZHZJJMpWZpUiDEKm7';
    var map = L.mapquest.map('map', {
        center: [lat, long],
        layers: L.mapquest.tileLayer('map'),
        zoom: 8
    }); map.addControl(L.mapquest.control());
        if (name) {
        L.mapquest.textMarker([lat, long], {
            text: name,
            position: "right",
            type: "marker",
            icon: {
            primaryColor: "#333333",
            secondaryColor: "#333333",
            size: "sm"
        }
        }).addTo(map)
    }
}

// When the user clicks the submit button,
$("#submitBtn").on("click", function(event) {
    var y = $("#stateSelection option:selected").val();
    var z = y.toUpperCase()
    var stateLat =  $("#stateSelection option:selected").attr("data-lat")
    var stateLong =  $("#stateSelection option:selected").attr("data-long")
    // prevent the browse default
    event.preventDefault()
    // empty the table body element
    $("#table-body").empty()

    displayParks(y)
    // remove the current map
    map.remove()
    // add a new map in it's place and append it to the map-home ID in the HTML
    var mapDiv = $('<div id="map" style="width: 100%; height: 500px;">')
    $("#map-home").append(mapDiv)
 
    $("#location-query").html(z)

    loadMap(stateLat, stateLong)
    })


// On initial load, center the map Minnesota's lat and long
    loadMap(45.694454,-93.900192)
