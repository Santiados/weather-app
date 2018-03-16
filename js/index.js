
// Update button
$('#update').click(function(event) {
	location.reload(true);
});


// Log 
var x = 0;
var tryies = 0;
$('#button-log').click(function(event) {
	if(x==0){
		$(this).parent().css('height', '50%');
		$(this).children('img').css('transform', 'rotate(0deg)');
		x++;
	}else{
		$(this).parent().css('height', '0px');
		$(this).children('img').css('transform', 'rotate(180deg)');
		x--;
	}
});

function addLog(msg){
	$('#log').append('<p>' + msg + '</p>');
}

function comprobarKeys(key){

}


// Author: Santiago Rengifo

var codigoCiudad;
var latitud;
var longitud;


// API keys

var key1 = 'ykp2Zf34hfALgt9voOcFnBsWnLoel3qQ';
var key2 = 'S9Ftl9GuwzjBApU7BHlaNUaK87nJgKwr';
addLog('Both Keys loaded');

// Class Dia


class Dia {
	constructor(fecha,dia,noche,temperatura){
		this.fecha = fecha;
		this.dia = dia;
		this.noche = noche;
		this.temperatura = temperatura;	
	}

	getWeekDay(dateInfo){
		var dayName = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sábado'];
		var fecha = new Date(dateInfo);
		return dayName[fecha.getDay()];
	}

	getImg(img){
		img = img.toString();
		return (img.length==1)? '0'+ img: img;
	}

	convert(g){
		return Math.floor((g-32)*(5/9));
	}
	createBoxDay(){
		$('#days').append('<div class="dia">'
			+ '<h1>' + this.getWeekDay(this.fecha) + '</h1>'
			+ '<div class="morning"><p class="horario">Por la mañana</>' 
			+ '<img src="img/'+ this.getImg(this.dia.Icon) +'-s.png"/>' 
			+ '<p class="daySum" >' + this.dia.IconPhrase 
			+ '</p>'
			+'</div>'
			+ '<div class="evening"><p class="horario">Por la noche</p>' 
			+ '<img src="img/'+ this.getImg(this.noche.Icon) +'-s.png"/>' 
			+ '<p class="daySum">' + this.noche.IconPhrase + '</p>'
			+ '</div>'
			+ '<div class="temperature">' 
			+ '<span class="temp"> Temp: </span>'
			+ '<span class="max">' + this.convert(this.temperatura.Maximum.Value) + 'Cº</span>' 
			+ '<span class="min">' + this.convert(this.temperatura.Minimum.Value) + 'Cº</span>'
			+'</div>'

			+ '</div>');

	}
}



// Get Location -- lat and long

function getLocation() {
	try {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(showPosition,errorGeo);
		} else {
			addLog('Geolocation is not supported by this browser.');
		}
	} catch(e) {
    	// statements
    	console.log(e);
    }
}
function showPosition(position) {
	try {
		latitud = position.coords.latitude;
		longitud = position.coords.longitude;
		addLog('Coords: ' + latitud + '   ' + longitud);
		getCityCode(latitud,longitud,key1);
	} catch(e) {
    	// statements
    	console.log(e);
    }
}

function errorGeo(e){
	$('#days').html('');
	errMsg('Ops, Has denegado tu posicion');
	addLog('Maybe you dont want show your position');
	console.log(e)
}
function errMsg(msg){
	$('#days').append('<div class="dia">' + msg + '</h1></di>');
}

// Get Code City and 5 days weather

function takeCode(json,key){
	var ciudadInfo = {
		comunidad: json.AdministrativeArea.LocalizedName,
		ciudad: json.LocalizedName,
		codigo: json.Key
	};
	console.log(ciudadInfo)
	addLog('City code obtained');
	addLog('1 try');
	printHeader(ciudadInfo);
	getWeatherData(ciudadInfo,key);
}

function getCityCode(lat,long,key) {
	try {
		fetch('http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey='+ key +'%20&q='+ lat +'%2C'+ long+'&language=es-es')
		.then(respuesta => respuesta.json())
		.then(json => takeCode(json,key))
		.catch(e => {
			if(e){
				console.log(e)
				if(key==key2){
					$('#days').html('');
					addLog(e);
					addLog('Something went badly wrong!, Maybe you need to download the apk');
					errMsg('Quizas debas esperar un rato');	
					errMsg('Algo fue muy mal, quizas debas descargarte la aplicación <a href="https://github.com/Santiados/weather-app/tree/master">APP</a>');
					throw new Error("Something went badly wrong!");
				}
				addLog('Invalid key num 1');
				addLog('Trying with key num 2');
				getCityCode(latitud,longitud,key2);
			}
		});
	} catch(e) {
		// statements
		console.log(e);
		throw new Error("Something went badly wrong!");
	}
}

function show(datos){
	addLog('Weather data obtained');
	printDays(datos);
}


function getWeatherData(ciudad,key) {
	try {
		fetch('http://dataservice.accuweather.com/forecasts/v1/daily/5day/'+ciudad.codigo+'?apikey='+ key +'%20&language=es-es')
		.then(respuesta => respuesta.json())
		.then(json => show(json))
		.catch(e => {
			if(e){
				console.log(e)
			}
		});
	} catch(e) {
		// statements
		console.log(e);
		throw new Error("Something went badly wrong!");
	}
}

// Get Code City and 5 days weather ^ 

window.onload = getLocation();



// Print Informaction

function printHeader(ciudadInfo){
	$('#header').html('');
	$('#header').text(ciudadInfo.ciudad + ', ' + ciudadInfo.comunidad);
}

function printDays(datos){
	// Print summary

	$('#sumWeek').append('<h2> Prevision meteorolégica</h2>'
		+ '<p>' + datos.Headline.Text + '</p>');
	// Print summary
	$('#days').html('');
	//Print days
	var days = datos.DailyForecasts;
	days.forEach( function(element, index) {
		var day = new Dia(element.Date,element.Day,element.Night,element.Temperature);
		day.createBoxDay();
	});

}


