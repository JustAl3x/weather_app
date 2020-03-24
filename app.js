import { API_KEY } from './api.js';
const celsiusButton = document.querySelector("#celsius");
const fahrenheitButton = document.querySelector("#fahrenheit");
const submitButton = document.querySelector("#submit");
//Holds current weather info and associated functions.
let TodayWeather = (city, temp, weatherDesc, image) => {
    return {
        city,
        temp,
        weatherDesc,
        image
    }
}

//WeatherFetcher will hold all functions to retrieve from OpenWeatherAPI.
let WeatherFetcher = (function () {
    const inputBox = document.querySelector("#input");

    let _retrieveInput = () => {
        return inputBox.value;
    }

    let _convertTemp = (kelvinTemp) => {
        if (State.isCelsius) {
            return (kelvinTemp- 273.15)
        } else {
            return ((kelvinTemp - 273.15) * 9/5 + 32)
        }
    }

    async function getTodayWeather() {
        let inputText = _retrieveInput();
        
        //First, make sure there is text.
        if (inputText !== "") {
            let city = inputText;
            let temp = 0;
            let weatherDesc = '';
            let image = '';
            let URL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + `&APPID=` + API_KEY;

            let response = await requestFromAPI(URL);

            if (response !== null) {
                temp = _convertTemp(response.main.temp);
                weatherDesc = response.weather[0].description;
                image = response.weather[0].icon;

                return TodayWeather(city, temp, weatherDesc, image); 
            } else {
                return null;
            }
        } else {
            
            return null;
        }
    }
    //sends fetch request to api
    async function requestFromAPI (requestURL) {
        try {
            const response = await fetch(requestURL, {mode: "cors"});
            if (!response.ok) {
                throw new Error("Bad Request Code");
            }
            return response.json();
        } catch (error) {
            Renderer.clearData();
            Renderer.city.innerHTML = 'Oops, location not found!'
            return null;
        }
    }

    return {
        getTodayWeather,
    }
})();

//Responsible for rendering information onto page.
let Renderer = (function() {
    const tempDesc = document.querySelector("#tempDesc");
    const weatherDesc = document.querySelector("#weatherDesc");
    const city = document.querySelector("#city");
    const image = document.querySelector("#icon");
    
    //takes in an object of the current weather and displays to user
    let render = (weatherObj) => {
        if (weatherObj !== null) {
            //URL to retrieve the appropriate image.
            const iconURL = `http://openweathermap.org/img/wn/${weatherObj.image}@2x.png`
            city.innerHTML = weatherObj.city;
            tempDesc.innerHTML = (weatherObj.temp.toFixed(1)+ State.unitString());
            weatherDesc.innerHTML  = weatherObj.weatherDesc.toUpperCase();
            image.src = iconURL;
        } else {
            clearData();
            city.innerHTML = 'Oops, location not found!';
        }
    }

    let clearData = () => {
        city.innerHTML = '';
        tempDesc.innerHTML = "";
        weatherDesc.innerHTML  = "";
        image.src = "";
    }

    return {
        render,
        clearData,
        city
    }
})();

//Keeps track of any changing values as the user interacts with page.
let State = (function () {
    this.isCelsius = true;

    function swapUnit () {
        this.isCelsius = !this.isCelsius;
    }
    function unitString() {
        if (isCelsius) {
            return "ºC"
        } else {
            return "ºF"
        }
    }
    return {
        swapUnit: swapUnit,
        isCelsius: isCelsius,
        unitString,
    }
})();


submitButton.addEventListener("click", async () => {
    let weather = await WeatherFetcher.getTodayWeather();

    if (weather !== null) {
        Renderer.render(weather);
    }
})

celsiusButton.addEventListener("click", () => {
    if (!State.isCelsius) {
        State.swapUnit();
        celsiusButton.classList.toggle("selected");
        fahrenheitButton.classList.toggle("selected");
    }
})

fahrenheitButton.addEventListener("click", () => {
    if (State.isCelsius) {
        State.swapUnit();
        celsiusButton.classList.toggle("selected");
        fahrenheitButton.classList.toggle("selected");
    }
})
