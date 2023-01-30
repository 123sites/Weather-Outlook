// - Acceptance Criteria
// I made a weather dashboard that would run in the browser and feature dynamically updated HTML and CSS.  
// It shows the weather outlook for multiple cities, so anyone using it could plan a trip accordingly.

// 1) It has a weather dashoard with form inputs.
// 2) When searching for a city, there's current and future conditions.
// 3) That city is added to the search history.
// 4) When viewing current weather contions for that city it has the city name, date, 
//    and icon representation of weather conditions, temperature, humidity, and wind speed.
// 5) Future weather conditions show: A 5-day forecast that displays the date, 
//    an icon representation of weather conditions, the temp., wind speed, & humidty.
// 6) When clicking onto a city in the search history, there's current and future conditions.
// * Satisfies all of the above acceptance criteria plus the following:
//     * Uses the OpenWeather API to retrieve weather data.
//     * Uses `localStorage` to store persistent data.

// var
var apiKey = "d314441d6cadcf30d65e0ef7c952c567"
var today = moment().format('L');
var search = [];

// functions
function current(city) {
  var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  $.ajax({
    url: queryURL,
    method: "GET"
}).then(function(cityWeather) {
    console.log(cityWeather);
    
    $("#weather").css("display", "block");
    $("#cityInfo").empty();
       
    var iconCode = cityWeatherResponse.weather[0].icon;
    var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

    // WHEN I view current weather conditions for that city
    // THEN I am presented with the city name
    // the date
    // an icon representation of weather conditions
    // the temperature
    // the humidity
    // the wind speed
    var currentCity = $(`
        <h2 id="currentCity">
            ${cityWeatherResponse.name} ${today} <img src="${iconURL}" alt="${cityWeatherResponse.weather[0].description}" />
        </h2>
        <p>Temperature: ${cityWeatherResponse.main.temp} °F</p>
        <p>Humidity: ${cityWeatherResponse.main.humidity}\%</p>
        <p>Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
    `);

    $("#cityDetail").append(currentCity);

    // UV index
    var lat = cityWeatherResponse.coord.lat;
    var lon = cityWeatherResponse.coord.lon;
    var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    $.ajax({
        url: uviQueryURL,
        method: "GET"
    }).then(function(uviResponse) {
        console.log(uviResponse);

        var uvIndex = uviResponse.value;
        var uvIndexP = $(`
            <p>UV Index: 
                <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
            </p>
        `);

        $("#cityDetail").append(uvIndexP);

        futureCondition(lat, lon);

        // WHEN I view the UV index
        // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
        // 0-2 green#3EA72D, 3-5 yellow#FFF300, 6-7 orange#F18B00, 8-10 red#E53210, 11+violet#B567A4
        if (uvIndex >= 0 && uvIndex <= 2) {
            $("#uvIndexColor").css("background-color", "#3EA72D").css("color", "white");
        } else if (uvIndex >= 3 && uvIndex <= 5) {
            $("#uvIndexColor").css("background-color", "#FFF300");
        } else if (uvIndex >= 6 && uvIndex <= 7) {
            $("#uvIndexColor").css("background-color", "#F18B00");
        } else if (uvIndex >= 8 && uvIndex <= 10) {
            $("#uvIndexColor").css("background-color", "#E53210").css("color", "white");
        } else {
            $("#uvIndexColor").css("background-color", "#B567A4").css("color", "white"); 
        };  
    });
});
}

// function for future condition
function futureCondition(lat, lon) {

// THEN I am presented with a 5-day forecast
var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

$.ajax({
    url: futureURL,
    method: "GET"
}).then(function(futureResponse) {
    console.log(futureResponse);
    $("#fiveDay").empty();
    
    for (let i = 1; i < 6; i++) {
        var cityInfo = {
            date: futureResponse.daily[i].dt,
            icon: futureResponse.daily[i].weather[0].icon,
            temp: futureResponse.daily[i].temp.day,
            humidity: futureResponse.daily[i].humidity
        };

        var currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
        var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

        // displays the date
        // an icon representation of weather conditions
        // the temperature
        // the humidity
        var futureCard = $(`
            <div class="pl-3">
                <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                    <div class="card-body">
                        <h5>${currDate}</h5>
                        <p>${iconURL}</p>
                        <p>Temp: ${cityInfo.temp} °F</p>
                        <p>Humidity: ${cityInfo.humidity}\%</p>
                    </div>
                </div>
            <div>
        `);

        $("#fiveDay").append(futureCard);
    }
}); 
}

// add on click event listener 
$("#searchBtn").on("click", function(event) {
event.preventDefault();

var city = $("#enterCity").val().trim();
currentCondition(city);
if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    var searchedCity = $(`
        <li class="list">${city}</li>
        `);
    $("#searchHistory").append(searchedCity);
};

localStorage.setItem("city", JSON.stringify(searchHistory));
console.log(searchHistory);
});

// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city
$(document).on("click", ".list", function() {
var listCity = $(this).text();
currentCondition(listCity);
});

// WHEN I open the weather dashboard
// THEN I am presented with the last searched city forecast
$(document).ready(function() {
var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

if (searchHistoryArr !== null) {
    var lastSearchedIndex = searchHistoryArr.length - 1;
    var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
    currentCondition(lastSearchedCity);
    console.log(`Last searched city: ${lastSearchedCity}`);
}
});
