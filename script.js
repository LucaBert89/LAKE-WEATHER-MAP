let api1 = process.env.API_KEY;
let api2 = process.env.API_KEY2;



let cityBtn = document.getElementById("addcityBtn");
let suggestBtn = document.querySelector("#suggestBtn");


let iconWeather = document.querySelector("#weatherIcon");
let cityName = document.querySelector("#cityToday");
let temperature = document.querySelector("#temp")
let minTemperature = document.querySelector("#min");
let maxTemperature = document.querySelector("#max");
let searchCity = document.querySelector("#searchCity");
let lakes = [];
let message = document.querySelector("#errorMessage");

let latitude;
let longitude;
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
        });

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
    let apiKey = process.env.API_KEY2;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.API_KEY2}&lang=US`;
    
    fetch(url)  
        .then(res => {
        return res.json();
    })
    .then(body => {
        message.innerHTML = "";
        cityLatitude = body.coord.lat;
        cityLongitude = body.coord.lon;
        icon = body.weather[0].icon;
        nameC = body.name;
        temp = body.main.temp;
        tempMax = body.main.temp_max;
        tempMin = body.main.temp_min;   
    })
    .then (function () {
        displayWeather();
        map.setCenter({lat:cityLatitude, lng:cityLongitude});
        map.setZoom(10);
    })
    .catch(error => {
        message.innerHTML = "Nome della località non trovato!"
    })}

    function displayWeather () {
        iconWeather.setAttribute("src", "http://openweathermap.org/img/w/" + icon + ".png" ); 
        cityName.innerHTML = nameC  ;
        temperature.innerHTML = `${temp} °C`;
        minTemperature.innerHTML = `${tempMin} °C`;
        maxTemperature.innerHTML = `${tempMax} °C`;
        return;
    }


/*button to retrieve lakes location and then call marker function */
    function suggestLocation() {
        
        map.setCenter({lat:cityLatitude, lng:cityLongitude});
        map.setZoom(10);

        limits = 20;
        let apiKey = process.env.API_KEY;

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
            apiWeather(lakePos.lat, lakePos.lng);
            apiName(lakePos.lat, lakePos.lng);
        });
        }

        function removeMarker(marker) {
            if(map.getObjects(marker).length == limits){
                map.removeObjects(marker);
            }}
            
}
            

/*pass longitude and latitude to weather API */
    function apiWeather(lat, lon) {
          let apiKey = process.env.API_KEY2;
          let url =  `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.API_KEY2}&lang=US`;
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
                iconWeather[daytag].setAttribute("src", "http://openweathermap.org/img/w/" + icon + ".png" );
                temp[daytag].innerHTML = body.daily[day].temp.day + "°C";
            }
            dayForecast(0,1)
            dayForecast(1,2)
            dayForecast(2,3)
        }
        )}

    function apiName(lat, lon) {
        let apiKey = process.env.API_KEY;
        let url = `https://browse.search.hereapi.com/v1/browse?at=${lat},${lon}&limit=${limits}&categories=350-3500-0304&apikey=${process.env.API_KEY}`;
        fetch(url)  
            .then(res => {
            return res.json();
        })
        .then(body => {
            console.log(body);
            let lakeForecast = document.querySelector("#lakeForecast");
            lakeForecast.innerHTML = body.items[0].title;
    })}

