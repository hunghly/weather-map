import {darkSkyToken, mapboxToken} from "./keys.js";

{
    "use strict";
    $(document).ready(() => {
        /*-----Creating the Map-----*/
        mapboxgl.accessToken = mapboxToken;
        let mapOptions = {
            container: 'mapbox-map',
            style: 'mapbox://styles/mapbox/streets-v11',
            zoom: 10,
            // scrollZoom: false,
            center: [0, 0]
        };
        let map = new mapboxgl.Map(mapOptions);
        /*-----Added Navigation Controls-----*/
        let nav = new mapboxgl.NavigationControl();
        map.addControl(nav, 'top-left');
        /*-----Added Marker-----*/
        let marker = new mapboxgl.Marker({
            draggable: true,
            color: '#ffda92'
        })
            .setLngLat([0, 0])
            .addTo(map);
        /*-----When marker is dragged, it will update coordinates display-----*/
        let onDragEnd = () => {
            let lngLat = marker.getLngLat();
            coordinates.style.display = 'block';
            coordinates.innerHTML =
                'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat;
            renderLoadingPage();
            getWeatherInfo(darkSkyToken, lngLat, celsiusFlag, hourlyFlag);
        };
        /*-----Holds links to WX icons-----*/
        let weatherIconArray = {
            clearDay: './img/wx-icons/png/clear-day.png',
            clearNight: './img/wx-icons/png/clear-night.png',
            rain: './img/wx-icons/png/rain.png',
            snow: './img/wx-icons/png/snow.png',
            sleet: './img/wx-icons/png/sleet.png',
            wind: './img/wx-icons/png/wind.png',
            fog: './img/wx-icons/png/fog.png',
            cloudy: './img/wx-icons/png/cloudy.png',
            partlyCloudyDay: './img/wx-icons/png/partly-cloudy-day.png',
            partlyCloudyNight: './img/wx-icons/png/partly-cloudy-night.png'
        };
        /*-----Temperature Flag-----*/
        let celsiusFlag = false;
        /*-----Forecast Flag-----*/
        let hourlyFlag = false;
        /*-----Current coordinates-----*/
        let currentCoords = {
            lat: 0,
            lng: 0
        };
        /*-----Will retrieve WX links from input-----*/
        let getWeatherIcon = (weather) => {
            switch (weather) {
                case "clear-day":
                    return weatherIconArray.clearDay;
                case "clear-night":
                    return weatherIconArray.clearNight;
                case "rain":
                    return weatherIconArray.rain;
                case "snow":
                    return weatherIconArray.snow;
                case "sleet":
                    return weatherIconArray.sleet;
                case "wind":
                    return weatherIconArray.wind;
                case "fog":
                    return weatherIconArray.fog;
                case "cloudy":
                    return weatherIconArray.cloudy;
                case "partly-cloudy-day":
                    return weatherIconArray.partlyCloudyDay;
                case "partly-cloudy-night":
                    return weatherIconArray.partlyCloudyNight;
                default:
                    return false;
            }
        };
        /*-----Will retrieve map stype from input-----*/
        let getMapStyle = (map) => {
            switch (map) {
                case "Street":
                    return 'mapbox://styles/mapbox/streets-v11';
                case "Outdoors":
                    return 'mapbox://styles/mapbox/outdoors-v11';
                case "Light":
                    return 'mapbox://styles/mapbox/light-v10';
                case "Dark":
                    return 'mapbox://styles/mapbox/dark-v10';
                case "Satellite":
                    return 'mapbox://styles/mapbox/satellite-v9';
                case "Satellite Street":
                    return 'mapbox://styles/mapbox/satellite-streets-v11';
                case "Navigation Day":
                    return 'mapbox://styles/mapbox/navigation-preview-day-v4';
                case "Navigation Night":
                    return 'mapbox://styles/mapbox/navigation-preview-night-v4';
                case "Navigation Guidance Day":
                    return 'mapbox://styles/mapbox/navigation-guidance-day-v4';
                case "Navigation Guidance Night":
                    return 'mapbox://styles/mapbox/navigation-guidance-night-v4';
                default:
                    return false;
            }
        };
        /*-----Requests weather object from Dark Sky API using lat/long coords-----*/
        let getWeatherInfo = (key, coordinates, tempFlag, hourlyFlag) => {
            $.ajax({
                url: `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${key}/${coordinates.lat},${coordinates.lng}`,
                type: 'GET',
            }).done((data) => {
                console.log(data);
                renderAll(data, coordinates, tempFlag, hourlyFlag);
                return data;
            })
        };
        /*-----Parses numerical day-----*/
        let getDay = (day) => {
            switch (day) {
                case 0:
                    return 'Sunday';
                case 1:
                    return 'Monday';
                case 2:
                    return 'Tuesday';
                case 3:
                    return 'Wednesday';
                case 4:
                    return 'Thursday';
                case 5:
                    return 'Friday';
                case 6:
                    return 'Saturday';
                default:
                    return false;
            }
        };
        /*-----Creates html string for specified day (index)-----*/
        let createDailyWxHTML = (darkSkyObject, index, tempFlag) => {
            let date = new Date(darkSkyObject.daily.data[index].time * 1000);
            let dateArray = date.toLocaleDateString("en-US", {
                dateStyle: 'full',
                timeZone: darkSkyObject.timezone
            }).split((","));
            let tempValue;
            if (tempFlag) tempValue = `Lo. ${((darkSkyObject.daily.data[index].temperatureLow - 32) * (5 / 9)).toFixed(2)}°C / Hi. ${((darkSkyObject.daily.data[index].temperatureHigh - 32) * (5 / 9)).toFixed(2)}°C`;
            else tempValue = `Lo. ${darkSkyObject.daily.data[index].temperatureLow}°F / Hi. ${darkSkyObject.daily.data[index].temperatureHigh}°F`;
            return `
                <div class="top-body-container">
                    <h1 class="day">${dateArray[0]}</h1>
                    <h1 class="date">${dateArray[1].trim().slice(dateArray[1].lastIndexOf(" "))}</h1>
                    <img class="wx-icon" src="${getWeatherIcon(darkSkyObject.daily.data[index].icon)}" alt="a photo of a ${darkSkyObject.daily.data[index].icon}">
                </div>
                <div class="bottom-body-container">
                    <p class="wx-summary">${darkSkyObject.daily.data[index].summary}</p>
                    <p class="wx-low-high">${tempValue}</p>
                    <p class="wx-precipitation">Precipitation Chance: ${(darkSkyObject.daily.data[index].precipProbability * 100).toFixed(1)}%</p>
                    <p class="wx-humidity">Humidity: ${darkSkyObject.daily.data[index].humidity * 100}%</p>
                    <p class="wx-winds">Winds: ${darkSkyObject.daily.data[index].windSpeed}MPH from ${darkSkyObject.daily.data[index].windBearing}° with ${darkSkyObject.daily.data[index].windGust}MPH gust</p>
                    <p class="wx-pressure">Sea-level pressure: ${darkSkyObject.daily.data[index].pressure}mbar</p>
                </div>`;
        };
        /*-----Searches for the city based on the coordinates and returns information-----*/
        let getCityInfo = (coordinates) => {
            return reverseGeocode(coordinates, mapboxToken).then((result) => {
                console.log(result);
                let locationArray = result.split(',');
                let cityObj = {
                    name: locationArray[locationArray.length - 3],
                    state: locationArray[locationArray.length - 2],
                    country: locationArray[locationArray.length - 1]
                };
                return cityObj;
            }).catch((error) => {
                return error;
            });
        };
        /*-----Search the location using GeoCode-----*/
        let searchLocation = (inputValue, tempFlag, hourlyFlag) => {
            if (inputValue.charAt(0) === '%') {
                /*-----Parse the Lat/Long input if '%' is used-----*/
                let latLongArr = inputValue.split(',');
                getWeatherInfo(darkSkyToken, {
                    lat: parseFloat(latLongArr[0].slice(1).trim()),
                    lng: parseFloat(latLongArr[1].trim())
                });
            } else {
                /*-----Search by location using GeoCode-----*/
                geocode(inputValue, mapboxToken).then(function (result) {
                    getWeatherInfo(darkSkyToken, {lat: result[1], lng: result[0]}, tempFlag, hourlyFlag);
                });
            }
        };
        /*-----Renders the city heading HTML elements-----*/
        let renderCityHeading = (darkSkyObject, coordinates, tempFlag) => {
            let currentDate = new Date(darkSkyObject.currently.time * 1000);
            getCityInfo(coordinates).then((data) => {
                let name;
                let tempValue;
                if (data.name === undefined) name = '';
                else name = `${data.name},`;
                if (tempFlag) tempValue = `Current Temp: ${((darkSkyObject.currently.temperature - 32) * (5 / 9)).toFixed(2)}°C`;
                else tempValue = `Current Temp: ${darkSkyObject.currently.temperature}°F`;

                let htmlString = `
                 <h2 id="city-name">${name}</h2>
                 <h2 id="state-name">${data.state},</h2>
                 <h2 id="country-name">${data.country}</h2>
                 <h1 id="current-temperature">${tempValue}</h1>
                 <p id="time-accessed">As of ${currentDate.toDateString('en-US')} - ${currentDate.toLocaleTimeString('en-US')}</p>`;
                $('#city-heading-container').html(htmlString);
            });
        };
        /*-----Renders the current day HTML elements-----*/
        let renderCurrentDay = (darkSkyObject, tempFlag) => {
            let date = new Date(darkSkyObject.daily.data[0].time * 1000);
            let dateArray = date.toLocaleDateString("en-US", {
                dateStyle: 'full',
                timeZone: darkSkyObject.timezone
            }).split((","));
            let tempValue, loHiValue;
            if (tempFlag) {
                tempValue = `feels like ${((darkSkyObject.currently.apparentTemperature - 32) * (5 / 9)).toFixed(2)}°C`;
                loHiValue = `Lo. ${((darkSkyObject.daily.data[0].temperatureLow - 32) * (5 / 9)).toFixed(2)}°C / Hi. ${((darkSkyObject.daily.data[0].temperatureHigh - 32) * (5 / 9)).toFixed(2)}°C`;
            } else {
                tempValue = `feels like ${darkSkyObject.currently.apparentTemperature}°F`;
                loHiValue = `Lo. ${darkSkyObject.daily.data[0].temperatureLow}°F / Hi. ${darkSkyObject.daily.data[0].temperatureHigh}°F`;
            }
            let htmlString = `
                <div class="top-body-container">
                    <h1 class="day">${dateArray[0]}</h1>
                    <h1 class="date">${dateArray[1].trim().slice(dateArray[1].lastIndexOf(" "))}</h1>
                    <img class="wx-icon" src="${getWeatherIcon(darkSkyObject.currently.icon)}" alt="a photo of a ${darkSkyObject.currently.icon}">
                </div>
                <div class="bottom-body-container">
                    <p class="wx-summary">${darkSkyObject.currently.summary}</p>
                    <p class="wx-feels-like">${tempValue}</p>
                    <p class="wx-low-high">${loHiValue}</p>
                    <p class="wx-precipitation">Precipitation Chance: ${(darkSkyObject.currently.precipProbability * 100).toFixed(1)}%</p>
                    <p class="wx-humidity">Humidity: ${(darkSkyObject.currently.humidity * 100).toFixed(1)}%</p>
                    <p class="wx-winds">Winds: ${darkSkyObject.currently.windSpeed}MPH from ${darkSkyObject.currently.windBearing}° with ${darkSkyObject.currently.windGust}MPH gust</p>
                    <p class="wx-pressure">Sea-level pressure: ${darkSkyObject.currently.pressure}mbar</p>\
                </div>`;
            $('#main-body-container-1').html(htmlString);
        };
        /*-----Renders the next day HTML elements-----*/
        let renderNextDay = (darkSkyObject, tempFlag) => {
            let htmlString = createDailyWxHTML(darkSkyObject, 1, tempFlag);
            $('#main-body-container-2').html(htmlString);
        };
        /*-----Renders the day after next day HTML elements-----*/
        let renderDayAfterNext = (darkSkyObject, tempFlag) => {
            let htmlString = createDailyWxHTML(darkSkyObject, 2, tempFlag);
            $('#main-body-container-3').html(htmlString);
        };
        /*-----Renders the loading page for 2.5s-----*/
        let renderLoadingPage = () => {
            $('#menu-sidebar-container').slideUp(200);
            $('.sub-links').hide(200);
            $('.wrapper').toggleClass('blurred');
            $('.body-container, .top-body-container-split, .bottom-body-container-split, #mapbox-container').fadeOut(200).delay(1500).fadeIn(200);
            $('#loading-modal').fadeIn(400).delay(1800).fadeOut(400);
            setTimeout(() => {
                $('.wrapper').toggleClass('blurred');
            }, 2300);
        };
        /*-----Renders the hourly weather-----*/
        let renderHourly = (darkSkyObject, tempFlag, index) => {
            let currentHourlyDate, nextHourlyDate, tempValue, nextTempValue;
            for (let i = 0; i < 6; i += 2) {
                currentHourlyDate = new Date(darkSkyObject.hourly.data[i].time * 1000);
                nextHourlyDate = new Date(darkSkyObject.hourly.data[i + 1].time * 1000);
                let currHourlyArray = currentHourlyDate.toLocaleDateString("en-US", {
                    dateStyle: 'full',
                    timeZone: darkSkyObject.timezone
                }).split((","));
                let nextHourlyArray = nextHourlyDate.toLocaleDateString("en-US", {
                    dateStyle: 'full',
                    timeZone: darkSkyObject.timezone
                }).split(",");

                if (tempFlag) {
                    tempValue = `feels like ${((darkSkyObject.hourly.data[i].apparentTemperature - 32) * (5 / 9)).toFixed(2)}°C`;
                    nextTempValue = `feels like ${((darkSkyObject.hourly.data[i + 1].apparentTemperature - 32) * (5 / 9)).toFixed(2)}°C`;
                } else {
                    tempValue = `feels like ${darkSkyObject.hourly.data[i].apparentTemperature}°F`;
                    nextTempValue = `feels like ${darkSkyObject.hourly.data[i + 1].apparentTemperature}°F`;
                }
                let htmlString = `
                <div class="top-body-container-split">
                    <div class="left-top-body-container">
                        <img class="small-wx-icon" src="${getWeatherIcon(darkSkyObject.hourly.data[i].icon)}" alt="a photo of a ${darkSkyObject.currently.icon}">
                        <h1 class="small-time">${currentHourlyDate.toLocaleTimeString('en-US', {
                    timeStyle: 'short',
                    timeZone: darkSkyObject.timezone
                })}</h1>
                        <h1 class="small-day">${currHourlyArray[0]} — ${currHourlyArray[1]}</h1>
                    </div>
                    <div class="right-top-body-container">
                        <p class="wx-summary">${darkSkyObject.hourly.data[i].summary}</p>
                        <p class="wx-feels-like">${tempValue}</p>
                        <p class="wx-precipitation">Precipitation Chance: ${(darkSkyObject.hourly.data[i].precipProbability * 100).toFixed(1)}%</p>
                        <p class="wx-winds">Winds: ${darkSkyObject.hourly.data[i].windSpeed}MPH from ${darkSkyObject.hourly.data[i].windBearing}° with ${darkSkyObject.hourly.data[i].windGust}MPH gust</p>
                    </div> 
                </div>
                <div class="bottom-body-container-split">
                    <div class="left-bottom-body-container">
                        <img class="small-wx-icon" src="${getWeatherIcon(darkSkyObject.hourly.data[i + 1].icon)}" alt="a photo of a ${darkSkyObject.currently.icon}">
                        <h1 class="small-time">${nextHourlyDate.toLocaleTimeString('en-US', {
                    timeStyle: 'short',
                    timeZone: darkSkyObject.timezone
                })}</h1>
                        <h1 class="small-day">${nextHourlyArray[0]} — ${nextHourlyArray[1]}</h1>
                    </div>
                    <div class="right-bottom-body-container">
                        <p class="wx-summary">${darkSkyObject.hourly.data[i + 1].summary}</p>
                        <p class="wx-feels-like">${nextTempValue}</p>
                        <p class="wx-precipitation">Precipitation Chance: ${(darkSkyObject.hourly.data[i + 1].precipProbability * 100).toFixed(1)}%</p>
                        <p class="wx-winds">Winds: ${darkSkyObject.hourly.data[i + 1].windSpeed}MPH from ${darkSkyObject.hourly.data[i + 1].windBearing}° with ${darkSkyObject.hourly.data[i + 1].windGust}MPH gust</p>
                    </div> 
                </div>`;
                $(`#main-body-container-${index}`).html(htmlString);
                index++;
            }
        };
        /*-----Calls all of the render functions-----*/
        let renderAll = (data, coordinates, tempFlag, hourlyFlag) => {
            renderCityHeading(data, coordinates, tempFlag);
            if (!hourlyFlag) {
                renderCurrentDay(data, tempFlag);
                renderNextDay(data, tempFlag);
                renderDayAfterNext(data, tempFlag);
            } else renderHourly(data, tempFlag, 1);
            map.setCenter([coordinates.lng, coordinates.lat]);
            marker.setLngLat([coordinates.lng, coordinates.lat]);
            $('#coordinates').html(`Latitude: ${coordinates.lat}<br>Longitude: ${coordinates.lng}`);
            $('#search-location-input').val("");
            currentCoords = coordinates;
        };
        /*-----Event Listeners-----*/
        $('#question-tooltip').click(function () {
            $(this).fadeOut(800);
        });
        $('#question-icon').click(function () {
            $('#question-tooltip').fadeIn(800);
        });
        $('#search-location-button').click(() => {
            let inputValue = $('#search-location-input').val();
            if (inputValue) {
                renderLoadingPage();
                searchLocation(inputValue, celsiusFlag, hourlyFlag);
            }
        });
        $('#search-location-input').keydown((e) => {
            let inputValue = $('#search-location-input').val();
            if (e.key === 'Enter' && inputValue) {
                renderLoadingPage();
                searchLocation(inputValue, celsiusFlag, hourlyFlag);
            }
        });
        $('#menu-open-icon, #menu-close-icon').click(() => {
            $('#menu-sidebar-container').slideToggle(400);
            $('.sub-links').hide(400);
        });
        $('.menu-item').children(0).click(function () {
            $(this).next().slideToggle(400);
        });
        $('#fahrenheit-flag').click(() => {
            celsiusFlag = false;
            renderLoadingPage();
            getWeatherInfo(darkSkyToken, currentCoords, celsiusFlag, hourlyFlag);
        });
        $('#celsius-flag').click(() => {
            celsiusFlag = true;
            renderLoadingPage();
            getWeatherInfo(darkSkyToken, currentCoords, celsiusFlag, hourlyFlag);
        });
        $('#hourly-flag').click(() => {
            hourlyFlag = true;
            renderLoadingPage();
            getWeatherInfo(darkSkyToken, currentCoords, celsiusFlag, hourlyFlag);
        });
        $('#3-day-flag').click(() => {
            hourlyFlag = false;
            renderLoadingPage();
            getWeatherInfo(darkSkyToken, currentCoords, celsiusFlag, hourlyFlag);
        });
        $('#street-links').children().click(function () {
            map.setStyle(getMapStyle($(this).text()));
            renderLoadingPage();
            getWeatherInfo(darkSkyToken, currentCoords, celsiusFlag, hourlyFlag);
        });
        marker.on('dragend', onDragEnd);
        /*----Initially loads into San Antonio Area*/
        let initialCoordinates = {
            lat: 29.424349,
            lng: -98.491142
        };
        getWeatherInfo(darkSkyToken, initialCoordinates, celsiusFlag, hourlyFlag);
    });
}