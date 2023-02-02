// - Acceptance Criteria
// I made a weather dashboard that would run in the browser and feature dynamically 
// updated HTML and CSS.  It shows the weather outlook for multiple cities for 5 days.  
// I used [OpenWeather API](https://openweathermap.org/api) to get the weather information 
// and used local storage to store the information. In addition:

// 1) It has a weather dashoard with form inputs.
// 2) When searching for a city, there's current and future conditions.
// 3) That city is added to the search history.
// 4) When viewing current weather conditions for that city it has the its name, date, 
//    and icon representation of weather conditions, temperature, humidity, and wind speed.
// 5) Future weather conditions show: A 5-day forecast that displays the date, 
//    an icon representation of weather conditions, the temp., wind speed, & humidity.
// 6) When clicking onto a city in the search history, there's current and future conditions.
//    This satisfies all of the above acceptance criteria plus the following:
//    * Uses the OpenWeather API to retrieve weather data.
//    * Uses localStorage to store persistent data.

// var
var apiKey = "f5ccdbcb01401feaa8efc63bcac3649b"
// var today = dayjs();
var today = moment().format('L');
var search = [];
// current and future conditions
function currentCondition(city) {
    // q parameter: city name, state code and country code.....
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
    fetch(queryURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (cityWeatherResponse) {
            // console.log(cityWeatherResponse);
            $("#weather").css("display", "block");
            // clears-out the information
            $("#cityInfo").empty();

            var iconCode = cityWeatherResponse.weather[0].icon;
            var iconURL = `http://openweathermap.org/img/wn/${iconCode}.png`;
            var currentCity = $(`
        <h2 id="currentCity">
            ${cityWeatherResponse.name} ${today} <img src="${iconURL}" alt="${cityWeatherResponse.weather[0].description}" />
        </h2>
        <p>Temperature: ${cityWeatherResponse.main.temp} °F</p>
                <p>Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
        <p>Humidity: ${cityWeatherResponse.main.humidity}\%</p>
    `);
            $("#cityInfo").append(currentCity);
            // function for the future condition
            function futureCondition(lat, lon) {
                // 5-day forecast
                var futureURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;
                fetch(futureURL)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (futureResponse) {
                        console.log(futureResponse);
                        $("#fiveDay").empty();
                        for (let i = 1; i < futureResponse.list.length; i++) {
                            if (futureResponse.list[i].dt_txt.includes("12:00:00")) {
                                var cityInfo = {
                                    date: futureResponse.list[i].dt,
                                    icon: futureResponse.list[i].weather[0].icon,
                                    temp: futureResponse.list[i].main.temp,
                                    wind: futureResponse.list[i].wind.speed,
                                    humidity: futureResponse.list[i].main.humidity
                                };
                                var currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
                                var iconURL = `<img src="http://openweathermap.org/img/wn/${cityInfo.icon}.png" alt="${futureResponse.list[i].weather[0].main}" />`;
                                var futureCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-dark" style="width: 14rem;>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            ${iconURL}
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Wind: ${cityInfo.wind} MPH</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);
                                $("#fiveDay").append(futureCard);
                            }
                        }
                    });
            }
            // UV index
            var lat = cityWeatherResponse.coord.lat;
            var lon = cityWeatherResponse.coord.lon;
            var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            $.ajax({
                url: uviQueryURL,
                method: "GET"
            }).then(function (uviResponse) {
                console.log(uviResponse);

                var uvIndex = uviResponse.value;
                var uvIndexP = $(`
            <p>UV Index: 
                <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
            </p>
        `);

                $("#cityInfo").append(uvIndexP);

                futureCondition(lat, lon);
            });
        });
}
// searchBtn click event & localStorage
$("#searchBtn").on("click", function (event) {
    event.preventDefault();
    var searchHistory = JSON.parse(localStorage.getItem("city")) || []
    // input is here???
    var city = $("#enterCity").val().trim();
    currentCondition(city);
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        var searchedCity = $(`
        <li class="list">${city}</li>
        `);
        $("#searchHistory").append(searchedCity);
    };
    // Below stores the data, localStorage & searchHistory
    localStorage.setItem("city", JSON.stringify(searchHistory));
    console.log(searchHistory);
});

// Below is for getting to the site and accessing cities in localStorage.
function loadUp() {
    var searchHistory = JSON.parse(localStorage.getItem("city")) || []
    if (searchHistory.length > 0) {
        for (var i = 0; i < searchHistory.length; i++) {
            var searchedCity = $(`
            <li class="list">${searchHistory[i]}</li>
            `);
            $("#searchHistory").append(searchedCity);
        }
    }
}
loadUp();

// Get the input field
var input = document.getElementById("enterCity");
// Execute a function when the user presses a key on the keyboard
input.addEventListener("keypress", function (event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("searchBtn").click();
    }
});

// When click city in search history = current & future conditions for it.
$(".list").on("click", function () {
    // retrieves the text onclick
    var city = $(this).text();
    // console.log(city);
    currentCondition(city);
});

// When open the weather dashboard = last searched city forecast
$(document).ready(function () {
    // Retrieves the "city" data and stores it into localStorage:
    var shArr = JSON.parse(localStorage.getItem("city"));
// shArr = searchHistory array
    if (shArr !== null) {
        var lastSearchedIndex = shArr.length - 1;
        var lastSearchedCity = shArr[lastSearchedIndex];
        currentCondition(lastSearchedCity);
        // console.log(`Last searched city: ${lastSearchedCity}`);
    }
});
