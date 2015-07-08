/*
 *          WeatherUnderground is a service for reporting weather station data as well as getting forecasts.   Weather snoop automatically delivers weather information
             to weather underground and other services.   Weather underground won'92t store my pool temperature or other data that doesn'92t fit in its model so I need 
           a different way to report that data.

            For my automation I am only interested in the next 3 days predictions as far as highs, lows and rain conditions to determine what I should do with 
            various things related to energy usage

      getWeatherUndergroundData()   gets predictions for today and 2 days in advance for min, max conditions and wind
  
        I also set Google properties with the values returned and send the data to ATT M2X
         I also provide some helper functions to use in spreadsheets

 */

/**
 * 
 */

/****************************************************************************************************************
 * 
 */
function getWeatherUndergroundData() {
 
   var url = getSecureVal("WU", "URL");
   var json = UrlFetchApp.fetch(url).getContentText();
   var wuData = JSON.parse(json);
   var forecasts = wuData.forecast.simpleforecast.forecastday;
   var props = PropertiesService.getScriptProperties();
   props.setProperties( { 'wuTime': wuData.forecast.txt_forecast.date} );
   props.setProperties( { 'wu#f': forecasts.length } );

   if(forecasts.length < 3) Logger.log("Not enough forecasts\n");
   for (var i=0; i<3; i++) {
    var f = forecasts[i];
    var day = "wu" + String(i);
    props.setProperty( day + "Min", f.low.fahrenheit);
    props.setProperty( day + "Max", f.high.fahrenheit); 
    props.setProperty( day + "Cond", f.icon);
    props.setProperty( day + "MaxWind", f.maxwind.mph);
   }

  /* send to ATT M2X*/
  var streams = [ "wu0MaxWind", "wu0Max", "wu0Min", "wu0Cond",
                 "wu1MaxWind", "wu1Max", "wu1Min", "wu1Cond",
                 "wu2MaxWind", "wu2Max", "wu2Min", "wu2Cond",
                ];
  logProps(streams);
  sendDataATT("WU", streams);
                 
  return Date();
}
