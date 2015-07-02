{\rtf1\ansi\ansicpg1252\cocoartf1347\cocoasubrtf570
{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
\margl1440\margr1440\vieww17760\viewh19880\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural

\f0\fs24 \cf0 /**\
 *          WeatherUnderground is a service for reporting weather station data as well as getting forecasts.   Weather snoop automatically delivers weather information\
             to weather underground and other services.   Weather underground won\'92t store my pool temperature or other data that doesn\'92t fit in its model so I need \
           a different way to report that data.\
\
            For my automation I am only interested in the next 3 days predictions as far as highs, lows and rain conditions to determine what I should do with \
            various things related to energy usage\
\
      getWeatherUndergroundData()   gets predictions for today and 2 days in advance for min, max conditions and wind\
  \
        I also set Google properties with the values returned and send the data to ATT M2X\
         I also provide some helper functions to use in spreadsheets\
\
 */\
\
/**\
 * \
 */\
\
\
function getWeatherUndergroundData() \{\
 \
   var url = "http://api.wunderground.com/api/6769f6052217b824/forecast/q/CA/94402.json"\
   var json = UrlFetchApp.fetch(url).getContentText();\
   var wuData = JSON.parse(json);\
   var forecasts = wuData.forecast.simpleforecast.forecastday;\
   var props = PropertiesService.getScriptProperties();\
   props.setProperties( \{ 'wuTime': wuData.forecast.txt_forecast.date\} );\
   props.setProperties( \{ 'wu#f': forecasts.length \} );\
\
   if(forecasts.length < 3) Logger.log("Not enough forecasts\\n");\
   for (var i=0; i<3; i++) \{\
    var f = forecasts[i];\
    var day = "wu" + String(i);\
    props.setProperty( day + "Min", f.low.fahrenheit);\
    props.setProperty( day + "Max", f.high.fahrenheit); \
    props.setProperty( day + "Cond", f.icon);\
    props.setProperty( day + "MaxWind", f.maxwind.mph);\
   \}\
  setWeatherUndergroundATT();\
  return Date();\
\}\
\
/**\
 *  WU today forecast Functions\
 */\
function wu0Max() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu0Max'));\
\}\
function wu0Cond() \{\
  return PropertiesService.getScriptProperties().getProperty('wu0Cond');\
\}\
function wu0Min() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu0Min'));\
\}\
function wu0MaxWind() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu0MaxWind'));\
\}\
function wu1Max() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu1Max'));\
\}\
function wu1Cond() \{\
  return PropertiesService.getScriptProperties().getProperty('wu1Cond');\
\}\
function wu1Min() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu1Min'));\
\}\
function wu1MaxWind() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu1MaxWind'));\
\}\
function wu2Max() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu2Max'));\
\}\
function wu2Cond() \{\
  return PropertiesService.getScriptProperties().getProperty('wu2Cond');\
\}\
function wu2Min() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu2Min'));\
\}\
function wu2MaxWind() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wu2MaxWind'));\
\}\
\
\
function setWeatherUndergroundATT()\
\{\
  var wsApiKey = "faff2c5031617c9556cecad405581e45";\
  var streams = [ "wu0MaxWind", "wu0Max", "wu0Min", "wu0Cond",\
                 "wu1MaxWind", "wu1Max", "wu1Min", "wu1Cond",\
                 "wu2MaxWind", "wu2Max", "wu2Min", "wu2Cond",\
                 \
                ];\
  var headers =\
   \{     \
     "Content-Type": "application/json",\
     "X-M2X-KEY" : "7b9a9511f2a26e6472c9578336c79ed6",    \
      "Accept":    "*/*",\
   \}\
           \
  for (var i=0; i<streams.length; i++) \{\
     var updateWs = "https://api-m2x.att.com/v2/devices/" + wsApiKey + "/streams/" + streams[i] + "/value";\
     var payload = \{\
        "value": PropertiesService.getScriptProperties().getProperty(streams[i])\
     \}; \
      var attWriteOptions =\
     \{\
     "method" : "put",\
     "headers" : headers,\
     "muteHttpExceptions": true,\
     "payload": payload,\
     \};\
     Logger.log(updateWs);\
     Logger.log(attWriteOptions);\
     var json = UrlFetchApp.fetch(updateWs, attWriteOptions).getContentText();\
     Logger.log(json);\
     Utilities.sleep(1000);\
\}\
\}\
\
}