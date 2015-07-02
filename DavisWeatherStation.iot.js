{\rtf1\ansi\ansicpg1252\cocoartf1347\cocoasubrtf570
{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
\margl1440\margr1440\vieww17760\viewh19880\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural

\f0\fs24 \cf0 /**\
 *    Application:  Weathersnoop 3 \
      Device:  Davis Vantage Vue Weather Station\
      Device:  Davis Weather Envoy\
      Device:  Davis Extra Temperature Sensor\
\
        connected to a weather station in this case a Davis Vantage Vue\
        through a Davis Weather Envoy plugged into a MacMini USB port\
      Weathersnoop can be enabled to produce a web service which this API polls\
      API to weathersnoop:  \
      Davis Info:\
      Data is published to:   google properties, Devicehub.net and ATT M2X for data collection\
      For purposes of Monitoring and Automation I need only the max, min, current values for\
         indoor, outdoor temps, pool temperature and gusting wind speed as well as rain detection\
      attached my pool sensor to extraTemperature 2 through a Davis extra temperature sensor box.\
      Weathersnoop doesn\'92t know how to detect extra box and neither does Davis software on a mac. \
          To get extra sensor to work requires use of a windows PC and Davis Windows software\
      I use port forwarding through my router to gain access to the Mac mini running weather snoop \
      I use no-ip.com to get dynamic IP routing\
      \
     getWeatherStationData()  gets all the weather station data, sets google properties and publishes\
       ATT M2X\
    setWeatherStationData() sends google properties to ATT M2X IOT Platform\
    spreadsheet functions supported so that automation can be built directly into a spreadsheet\
    sendWeatherStationToHub() sends data to Devicehub.net\
      \
 */\
\
function getWeatherStationData() \{\
 \
   var url = "http://proactivechoice.ddns.net:9050/57CA15BD-E9AF-436A-9196-59D7EC3D7542.json"\
   var json = UrlFetchApp.fetch(url).getContentText();\
   var weatherData = JSON.parse(json);\
   var props = PropertiesService.getScriptProperties();\
   props.setProperties( \{ 'wsTime': weatherData.site.time \} );\
   \
\
  /* Pool Data */\
   var wsPoolCur = weatherData.site.properties.extraTemperature2.values[0].value;\
   var wsPoolMax = weatherData.site.properties.extraTemperature2.maxValueToday.values[0].value;\
   var wsPoolMin = weatherData.site.properties.extraTemperature2.minValueToday.values[0].value;\
   props.setProperties( \{ 'wsPoolCur': wsPoolCur, 'wsPoolMax': wsPoolMax, 'wsPoolMin': wsPoolMin \} );\
\
  /* Outdoor Temperature */\
   var outdoorCur = weatherData.site.properties.outdoorTemperature.values[0].value;\
   var outdoorMax = weatherData.site.properties.outdoorTemperature.maxValueToday.values[0].value;\
   var outdoorMin = weatherData.site.properties.outdoorTemperature.minValueToday.values[0].value;\
   props.setProperties( \{ 'outdoorCur': outdoorCur, 'outdoorMax': outdoorMax, 'outdoorMin': outdoorMin \} );\
\
   /* Indoor Temperature */\
   var indoorCur = weatherData.site.properties.indoorTemperature.values[0].value;\
   var indoorMax = weatherData.site.properties.indoorTemperature.maxValueToday.values[0].value;\
   var indoorMin = weatherData.site.properties.indoorTemperature.minValueToday.values[0].value;\
   props.setProperties( \{ 'indoorCur': indoorCur, 'indoorMax': indoorMax, 'indoorMin': indoorMin \} );\
\
   /* Wind Speed choices\
      windspeed, tenMinuteAverageWindSpeed, twoMinuteAverageWindSpeed, tenMinuteWindGust\
  */\
   var windSpeed = weatherData.site.properties.tenMinuteWindGust;\
   var windSpeedCur = windSpeed.values[0].value;\
   var windSpeedMax = windSpeed.maxValueToday.values[0].value;\
   var windSpeedMin = windSpeed.minValueToday.values[0].value;\
   props.setProperties( \{ 'windSpeedCur': windSpeedCur, 'windSpeedMax': windSpeedMax, 'windSpeedMin': windSpeedMin \} );\
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural
\cf0 \
/* Rain Data Choices\
                rainRate, dayRain\
*/\
   var rainRate = weatherData.site.properties.rainRate;  \
   var rainRateCur = rainRate.values[0].value;\
   var rainRateMax = rainRate.maxValueToday.values[0].value;\
   var rainRateMin = rainRate.minValueToday.values[0].value;   \
   props.setProperties( \{ 'rainRateCur': rainRateCur, 'rainRateMax': rainRateMax, 'rainRateMin': rainRateMin \} );\
\
   var dayRain = weatherData.site.properties.dayRain;\
   var dayRainCur = dayRain.values[0].value;\
   var dayRainMax = dayRain.maxValueToday.values[0].value;\
   var dayRainMin = dayRain.minValueToday.values[0].value;   \
   props.setProperties( \{ 'dayRainCur': dayRainCur, 'dayRainMax': dayRainMax, 'dayRainMin': dayRainMin \} );\
\
/* , uvIndex, solarRadiation, transmitterBatteryStatus, consoleBatteryVoltage */\
   var uvIndex = weatherData.site.properties.uvIndex;  \
   var solarRadiation = weatherData.site.properties.solarRadiation;\
   var transmitterBatteryStatus = weatherData.site.properties.transmitterBatteryStatus; \
   var consoleBatteryVoltage = weatherData.site.properties.consoleBatteryVoltage;\
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural
\cf0  \
   setWeatherStatationDataATT();\
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural
\cf0 \
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural
\cf0 \
   return Date();\
\}\
\
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural
\cf0 \
\
\
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural
\cf0 \
\
function setWeatherStatationDataATT()\
\{\
   /*  var payload = \{ \
    "values":  \{ \
       "outdoorCur": [\{ "value": PropertiesService.getScriptProperties().getProperty('outdoorCur') \}],\
       "outdoorMax": [\{ "value": PropertiesService.getScriptProperties().getProperty('outdoorMax') \}], \
       "outdoorMin": [\{ "value": PropertiesService.getScriptProperties().getProperty('outdoorMin') \}],\
       "indoorCur": [\{ "value": PropertiesService.getScriptProperties().getProperty('indoorCur') \}],\
       "indoorMax": [\{ "value": PropertiesService.getScriptProperties().getProperty('indoorMax') \}], \
       "indoorMin": [\{ "value": PropertiesService.getScriptProperties().getProperty('indoorMin') \}],\
       "wsPoolCur": [\{ "value": PropertiesService.getScriptProperties().getProperty('wsPoolCur') \}],\
       "wsPoolMax": [\{ "value": PropertiesService.getScriptProperties().getProperty('wsPoolMax') \}], \
       "wsPoolMin": [\{ "value": PropertiesService.getScriptProperties().getProperty('wsPoolMin') \}],\
       "windSpeedCur": [\{ "value": PropertiesService.getScriptProperties().getProperty('windSpeedCur') \}],\
       "windSpeedMax": [\{ "value": PropertiesService.getScriptProperties().getProperty('windSpeedMax') \}], \
       "windSpeedMin": [\{ "value": PropertiesService.getScriptProperties().getProperty('windSpeedMin') \}],\
     \}\
        \};  */ \
\
  var wsApiKey = "7fdc103b006f82fa195a8b58d23e1172"\
  var streams = [ "outdoorCur", "outdoorMax", "outdoorMin",\
                  "indoorCur", "indoorMax", "indoorMin",\
                  "windSpeedCur", "windSpeedMax", "windSpeedMin",\
                  "wsPoolCur", "wsPoolMax", "wsPoolMin",\
                ];\
  var headers =\
   \{     \
     "Content-Type": "application/json",\
     "X-M2X-KEY" : "31b6c1ed03ebca1626b8a104887b45e2",    \
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
\
/**\
 *  Pool Functions\
 */\
function wsPoolCur() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wsPoolCur'));\
\}\
function wsPoolMax() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wsPoolMax'));\
\}\
function wsPoolMin() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('wsPoolMin'));\
\}\
\
\
/**\
 *  Outdoor Functions\
 */\
function outdoorCur() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('outdoorCur'));\
\}\
function outdoorMax() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('outdoorMax'));\
\}\
function outdoorMin() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('outdoorMin'));\
\}\
\
/**\
 *  Indoor Functions\
 */\
function indoorCur() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('indoorCur'));\
\}\
function indoorMax() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('indoorMax'));\
\}\
function indoorMin() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('indoorMin'));\
\}\
\
/**\
 *  WindSpeed Functions\
 */\
function windSpeedCur() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('windSpeedCur'));\
\}\
function windSpeedMax() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('windSpeedMax'));\
\}\
function windSpeedMin() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('windSpeedMin'));\
\}\
\
\
function sendWeatherStationToHub() \{\
  var url = "https://api.devicehub.net/"; \
  var headers =\
   \{     \
     "Content-Type": "application/json",\
     "X-ApiKey": "d4460ad8-8ab1-4da8-85fd-a933b58a75f7",\
     "Accept":    "*/*",\
   \};\
\
  var demandUrl = url + "v2/project/4131/device/dc54077a-b7e1-4834-bd5a-4cd83eed5bb6/sensor/EnergyMonitor/data";\
  var demandPayload = \
      \{ "timestamp": time,\
       "value":    demand,\
      \};\
   var demandOptions =\
   \{\
     "method" : "post",\
     "headers" : headers,\
     "muteHttpExceptions": true,\
     "payload" : demandPayload,\
   \};\
\
   \
  var json = UrlFetchApp.fetch(demandUrl, demandOptions).getContentText();\
  \
  var priceUrl = url + "v2/project/4131/device/dc54077a-b7e1-4834-bd5a-4cd83eed5bb6/sensor/EnergyPrice/data";\
  var pricePayload = \
      \{ "timestamp": time,\
       "value":    price,\
      \};\
   var priceOptions =\
   \{\
     "method" : "post",\
     "headers" : headers,\
     "muteHttpExceptions": true,\
     "payload" : pricePayload,\
   \};\
  Logger.log(priceOptions); \
  \
  var json = UrlFetchApp.fetch(priceUrl, priceOptions).getContentText();\
\
\}\
\
}