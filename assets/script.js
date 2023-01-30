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

// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config()
// }

// var
var apiKey = "f5ccdbcb01401feaa8efc63bcac3649b"
var today = moment().format('L');
var search = [];

// functions
function current(city) {
  // q parameter: city name, state code and country code.....
  // var queryURL = 
  `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  $.ajax({
    url: queryURL,
    // {fetch(queryURL)
    method: "GET"
}).then(function(cityWeatherResponse) {
    console.log(cityWeatherResponse);
    
    $("#weather").css("display", "block");
    // clears-out the information
    $("#cityInfo").empty();
       
    var iconCode = cityWeatherResponse.weather[0].icon;
    var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

    // When get current weather conditions for that city,
    // See city name, date, & icon representation of weather conditions:
    // temp., humidity, & wind speed
    var currentCity = $(`
        <h2 id="currentCity">
            ${cityWeatherResponse.name} ${today} <img src="${iconURL}" alt="${cityWeatherResponse.weather[0].description}" />
        </h2>
        <p>Temperature: ${cityWeatherResponse.main.temp} °F</p>
        <p>Humidity: ${cityWeatherResponse.main.humidity}\%</p>
        <p>Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
    `);

    $("#cityInfo").append(currentCity);

    // UV index
    var lat = cityWeatherResponse.coord.lat;
    var lon = cityWeatherResponse.coord.lon;
    var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
i
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

        $("#cityInfo").append(uvIndexP);

        futureCondition(lat, lon);

        // UV conditions, by color
        // https://en.wikipedia.org/wiki/Ultraviolet_index#:~:text=A%20UV%20index%20reading%20of,broad%20spectrum%20SPF%2030%2B%20sunscreen.&text=A%20UV%20index%20reading%20of%206%20to%207%20means%20high,harm%20from%20unprotected%20sun%20exposure.
        if (uvIndex >= 0 && uvIndex <= 2) {
            $("#uvIndexColor").css("background-color", "#green").css("color", "white");
        } else if (uvIndex >= 3 && uvIndex <= 5) {
            $("#uvIndexColor").css("background-color", "#yellow");
        } else if (uvIndex >= 6 && uvIndex <= 7) {
            $("#uvIndexColor").css("background-color", "#orange");
        } else if (uvIndex >= 8 && uvIndex <= 10) {
            $("#uvIndexColor").css("background-color", "#red").css("color", "white");
        } else {
            $("#uvIndexColor").css("background-color", "#purple").css("color", "white"); 
        };  
    });
});
}

// function for the future condition
function futureCondition(lat, lon) {

// 5-day forecast
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

        // Displays the date, an icon representation of weather conditions
        // with the temperature & humidity
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

// input is here???
var city = $("#cityName").val().trim();
current(city);
if (!searchHistory.includes(city)) {
    searchHistory.push(city);
    var searchedCity = $(`
        <li class="list">${city}</li>
        `);
    $("#searchHistory").append(searchedCity);
};

// localStorage & searchHistory
localStorage.setItem("city", JSON.stringify(searchHistory));
console.log(searchHistory);
});

// When click city in search history = current & future conditions for it.
$(document).on("click", ".list", function() {
var city = $(this).text();
current(city);
});

// When open the weather dashboard = last searched city forecast
$(document).ready(function() {
var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

if (searchHistoryArr !== null) {
    var lastSearchedIndex = searchHistoryArr.length - 1;
    var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
    current(lastSearchedCity);
    console.log(`Last searched city: ${lastSearchedCity}`);
}
});
