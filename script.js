
const cityBtn = document.getElementById("addcityBtn");
const suggestBtn = document.querySelector("#suggestBtn");
const closeBtn = document.querySelector("#closeBtn");

let locations = document.querySelector("#locations");
let locationsWeather = document.querySelector("#locationsWeather");
let iconWeather = document.querySelector("#weatherIcon");
let cityName = document.querySelector("#cityToday");
let temperature = document.querySelector("#temp")
let minTemperature = document.querySelector("#min");
let maxTemperature = document.querySelector("#max");
let searchCity = document.querySelector("#searchCity");
let lakes = [];
let message = document.querySelectorAll(".errorMessage");

let cityLatitude;
let cityLongitude;
let arraylakesLat = [];
let arraylakesLong = [];

(function init () {
   function getPosition() {
        return new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej);
        });
    };
    
    getPosition()
        .then((position) => {
            cityLatitude = position.coords.latitude;
            cityLongitude = position.coords.longitude;
            map.setCenter({lat:cityLatitude, lng:cityLongitude});
            map.setZoom(10);

            let url = `https://api.openweathermap.org/data/2.5/weather?lat=${cityLatitude}&lon=${cityLongitude}&units=metric&appid=${process.env.API_KEY2}&lang=US`;
            fetch(url)  
                .then(res => {
                return res.json();
            })
            .then(body => {
                weatherData(body);
                displayWeather();
            })
        })
    
    closeBtn.addEventListener("click", closeForecast)
    cityBtn.addEventListener("click", cityWeather);
    suggestBtn.addEventListener("click", suggestLocation);
})();


/* BUILD THE MAP */

var platform = new H.service.Platform({
    'apikey': process.env.API_KEY
  });

var defaultLayers = platform.createDefaultLayers();

/*function setmap(lat, lng) {*/
   var map = new H.Map(
    
    document.getElementById('mapid'),
    defaultLayers.vector.normal.map,
    {
        center: {lat:52.5159, lng:13.3777},
        zoom: 10,
        pixelRatio: window.devicePixelRatio || 1
    });

    behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    ui = H.ui.UI.createDefault(map, defaultLayers);
    map.setBaseLayer(defaultLayers.raster.satellite.map);
        window.addEventListener('resize', () => map.getViewPort().resize());



/*API calls for city temperature and weather */
    function cityWeather() {
        let city = searchCity.value;
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.API_KEY2}&lang=US`;
        
        fetch(url)  
            .then(res => {
            return res.json();
        })
        .then(body => {
            weatherData(body);
        })
        .then (function () {
            displayWeather();
            map.setCenter({lat:cityLatitude, lng:cityLongitude});
            map.setZoom(10);
        })
        .catch(error => {
            return message[0].innerHTML = "Nome della località non trovato!"
        })
    }

        function displayWeather () {
            iconWeather.setAttribute("src", `https://openweathermap.org/img/w/` + icon + `.png` ); 
            temperature.innerHTML = `${temp} °C`;
            minTemperature.innerHTML = `${tempMin} °C`;
            maxTemperature.innerHTML = `${tempMax} °C`;
            return;
        }


/*button to retrieve lakes location and then call marker function */
    function suggestLocation() {
        message[1].innerHTML = ""
        if(cityLatitude === undefined) {
            return message[1].innerHTML = "You need to insert a location or allow geolocation!"
        }
        map.setCenter({lat:cityLatitude, lng:cityLongitude});
        map.setZoom(10);

        limits = 20;

        let url= `https://browse.search.hereapi.com/v1/browse?at=${cityLatitude},${cityLongitude}&limit=${limits}&categories=350-3500-0304&apikey=${process.env.API_KEY}`
        
        fetch(url)  
            .then(res => {
            return res.json();
        })
        .then(body => {
            for(i=0; i < body.items.length;i++) {
                arraylakesLat[i] = body.items[i].access[0].lat;
                arraylakesLong[i] = body.items[i].access[0].lng;
                
            }
            return [arraylakesLong,arraylakesLat];
        }) 
        .then(data => {
                addMarkersToMap(map);
        }
        )
        }
        
/*build the markers on the map adding a click event to retrieve latitude and longitude*/
    function addMarkersToMap(map) {
   
        removeMarker(lakes);
        for(i=0; i < limits; i++) {
            lake = new H.map.Marker({lat:arraylakesLat[i], lng:arraylakesLong[i]});
            lakes[i] = lake;
        }
              
        map.addObjects(lakes);
        
        for(i=0; i < limits;i++) {
        lakes[i].addEventListener('tap', function (evt) {
            var lakePos = map.screenToGeo(evt.currentPointer.viewportX,evt.currentPointer.viewportY);
            var x = window.matchMedia("(max-width: 760px)")
            if (x.matches) { 
                weatherOverlay();
            }
            apiWeather(lakePos.lat, lakePos.lng);
            apiName(lakePos.lat, lakePos.lng);
            
        });
        }

        function removeMarker(marker) {
            if(map.getObjects(marker).length == limits){
                map.removeObjects(marker);
            }}    
    }
            
    function weatherOverlay() {
        if(locations.getAttribute("class") == "container pb-5 active") {
            locations.classList.remove("active");
            locationsWeather.remove("overlay");
        } else {
            locations.classList.add("active");
            locationsWeather.classList.add("overlay");
        }
    }

/*pass longitude and latitude to weather API */
    function apiWeather(lat, lon) {
          let url =  `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.API_KEY2}&lang=US`;
          fetch(url)  
          .then(res => {
          return res.json();
      })
      .then(body => {

        let forecast = document.querySelectorAll(".forecast");
        let iconWeather = document.querySelectorAll(".weatherIcon");
        let temp = document.querySelectorAll(".tempForecast");
        let icon; 
        let dayWeather = document.querySelectorAll(".days");
        
        
           function dayForecast(daytag, day) {
                var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                var d = new Date(body.daily[day].dt * 1000);
                var dayName = days[d.getDay()];
                dayWeather[daytag].innerHTML = dayName;
                icon = body.daily[day].weather[0].icon;
                forecast[daytag].innerHTML = body.daily[day].weather[0].description;
                iconWeather[daytag].setAttribute("src", "https://openweathermap.org/img/w/" + icon + ".png" );
                temp[daytag].innerHTML = body.daily[day].temp.day + "°C";
            }
            dayForecast(0,1)
            dayForecast(1,2)
            dayForecast(2,3)
        }
        )
    }

    function apiName(lat, lon) {
        let url = `https://browse.search.hereapi.com/v1/browse?at=${lat},${lon}&limit=${limits}&categories=350-3500-0304&apikey=${process.env.API_KEY}`;
        fetch(url)  
            .then(res => {
            return res.json();
        })
        .then(body => {
            let lakeForecast = document.querySelector("#lakeForecast");
            lakeForecast.innerHTML = body.items[0].title;
        })
    }

    function weatherData(bdy) {
        message[0].innerHTML = "";
        cityLatitude = bdy.coord.lat;
        cityLongitude = bdy.coord.lon;
        icon = bdy.weather[0].icon;
        temp = bdy.main.temp;
        tempMax = bdy.main.temp_max;
        tempMin = bdy.main.temp_min; 
    }

    function closeForecast (){
        locations.classList.remove("active");
    }
