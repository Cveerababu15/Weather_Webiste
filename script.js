// This function converts a given timestamp (in seconds) into a readable date and time format
// Example: 
// If timestamp = 1711185600, it will return something like "23/03/2025, 5:30:00 PM" => depending on your local time settings
function dateformat(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

//extrametric values
async function fetchaqidata(lat, lon) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=60093f2a9c8e1660c9dd38bb62f69f60`);
    const data = await response.json();
    const components = data.list[0].components;

    $("#no2").text('NO2');
    $("#no2Value").text(components.no2);

    $("#o3").text('O3');
    $("#o3Value").text(components.o3);

    $("#co").text('CO');
    $("#coValue").text(components.co);

    $("#so2").text('SO2');
    $("#so2Value").text(components.so2);
}


// next five days weather report
async function nextfivedays(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=60093f2a9c8e1660c9dd38bb62f69f60&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        const dailyforecast = {};

        data.list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyforecast[date]) {
                dailyforecast[date] = {
                    temp: item.main.temp.toFixed(1),
                    icon: item.weather[0].icon,
                    day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
                };
            }
        });

        let forecastHtml = "";
        Object.keys(dailyforecast).slice(0, 5).forEach(date => {
            const forecast = dailyforecast[date];
            forecastHtml += `
                <div class="forecastrow d-flex align-items-center justify-content-between">
                    <div class="d-flex gap-1 align-items-center">
                        <img src="https://openweathermap.org/img/wn/${forecast.icon}@2x.png" alt="" width="35px">
                        <h6 class="m-0">${forecast.temp} &deg;C</h6>
                    </div>
                    <h6 class="m-0">${forecast.day}</h6>
                    <h6 class="m-0">${date}</h6>
                </div>
            `;
        });
        document.getElementById("forecastdiv").innerHTML = forecastHtml;
    } catch (error) {
        console.error(error);
        alert("Failed to retrieve weather data");
    }
}


// next Hours weather report 

async function today(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=60093f2a9c8e1660c9dd38bb62f69f60&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        let todaydate = data.list[0].dt_txt.split(" ")[0]; 
        let todayforecast = data.list.filter(item => item.dt_txt.startsWith(todaydate));
        
        // select time intervals
        let selecthours = todayforecast.slice(0, 6);

        let todayhtml = "";
        selecthours.forEach(item => {
            let time = new Date(item.dt_txt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            let temp = item.main.temp.toFixed(1); // round temperature
            let icon = item.weather[0].icon;  // weather icon

            todayhtml +=
                `
         <div class="todaytemp">
        <h6 class="m-0">${time}</h6>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="" width="35px">
        <h5>${temp}&deg;C</h5>
        </div>
        `;
        });
        document.getElementById("todaytempcontainer").innerHTML = todayhtml;


    } catch (error) {
        console.error(error);
        alert("Failed to fetch weather data");
    }
}


// cityname displays with weather report
async function fetchdata() {
    const cityname = encodeURIComponent(document.getElementsByClassName('inputfeild')[0].value);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=60093f2a9c8e1660c9dd38bb62f69f60&units=metric`);
    if (!response.ok) {
        alert("City not found. Please enter a valid city name.");
        return;
    }
    const data = await response.json();

    $('#cityname').text(data.name);
    $('#citytemp').text(data.main.temp.toFixed(1));
    $('#skyDesc').text(data.weather[0].description);
    $('#humidity').text(data.main.humidity);
    $('#pressure').text(data.main.pressure);
    $('#feelslike').text(data.main.feels_like);
    $('#visibility').text(data.visibility);

    const properDate = dateformat(data.dt).split(',');
    $('#date').text(properDate[0]);
    $('#time').text(properDate[1]);

    const sunriseTime = dateformat(data.sys.sunrise).split(',')[1];
    const sunsetTime = dateformat(data.sys.sunset).split(',')[1];

    $('#sunrisetime').text(sunriseTime);
    $('#sunsettime').text(sunsetTime);

    const lat = data.coord.lat;
    const lon = data.coord.lon;
    fetchaqidata(lat, lon);
    nextfivedays(lat, lon);
    today(lat, lon);
}
