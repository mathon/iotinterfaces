{\rtf1\ansi\ansicpg1252\cocoartf1347\cocoasubrtf570
{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
\margl1440\margr1440\vieww17760\viewh19880\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural

\f0\fs24 \cf0 /**\
      Service:  Rainforest.com (makes the Rainforest Eagle Zigbee smart meter power monitor)\
      Device:  Rainforest Eagle Zigbee smart meter power monitor     \
      Service:  PGE for historical data, rate data  NOT used at this time\
\
     The rainforest eagle can respond to API locally or through a proxy service in the cloud which effectively acts as a smart DNS\
     The rainforest eagle can get instantaneous demand for electricity as well as cumulative demand.  You can ask for current pricing for power and \
       characteristics of the pricing zone.  You can also ask historical questions of the service which keeps some data on the Eagle and some in the services\
       The eagle can talk to a number of vendors who can take the data and help you analyze your data usage.  I also hook the Eagle to Biggely which so far\
      has not provided very good analytics\
       The Eagle seems fairly robust and there are many modes it has for supporting how fast it polls the meter\
           \
     getEnergyStatsData() polls the Eagle and gets the latest information\
        sets Google properties to use in spreadsheets and also sends information to Devicehub.net and ATT M2X\
     sendEnergyToHub(time, demand, price)   sends data to devicehub.net\
      setEnergyDataATT()   sends data to ATT M2X\
    eInst()  these functions are available in spreadsheets to use for calculations or presentations\
    eTime() \
    ePrice() \
 */\
\
\
    \
function sendEnergyToHub(time, demand, price) \{\
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
\
function setEnergyDataATT()\
\{\
  var wsApiKey = "3e6b3a4e42b2fa92ec549477b5028315"\
  var streams = [ "ePrice", "eInst", "eCumm",\
                ];\
  var headers =\
   \{     \
     "Content-Type": "application/json",\
     "X-M2X-KEY" : "02900a7616043c0d24a1f8e6ace02ab6",    \
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
 *     Rainforest Eagle Energy Meter Data\
 */\
function getEnergyStatsData() \{\
 \
  /* var url = "https://proactivechoice.ddns.net:9030/"; */\
  var url = "https://rainforestcloud.com:9445/cgi-bin/post_manager";\
  var getDemand = "\\n\\r<Command>\\n\\r<Name>get_instantaneous_demand</Name>\\n\\r<MacId>0xd8d5b900000029ac</MacId>\\n\\r<Format>JSON</Format>\\n\\r</Command>\\n\\r";\
  var getPrice = "\\n\\r<Command>\\n\\r<Name>get_price</Name>\\n\\r<MacId>0xd8d5b900000029ac</MacId>\\n\\r<Format>JSON</Format>\\n\\r</Command>\\n\\r";\
\
  var headers =\
   \{     \
     "Accept": "*/*",\
     "Content-Type": "text/xml",\
     "User" : "john_mathon@yahoo.com",\
     "Cloud-Id" : "0010e7",\
     "Password" : "blue1sky",\
     "Connection" : "keep-alive",\
     "Pragma" : "no-cache",\
     "Cache-Control" : "no-cache"\
   \};\
   \
   var options_demand =\
   \{\
     "method" : "post",\
     "headers" : headers,\
     "payload" : getDemand\
   \};\
\
  var options_price =\
   \{\
     "method" : "post",\
     "headers" : headers,\
     "payload" : getPrice\
   \};\
\
   /* fetch inst demand */\
   var props = PropertiesService.getScriptProperties();\
   var json = UrlFetchApp.fetch(url, options_demand).getContentText();\
   var energyData = JSON.parse(json);\
   energyData = energyData.InstantaneousDemand;\
   Logger.log(energyData);\
   Jan12000 = 946684800; /* Jan 1, 2000 */\
  \
   var time = parseInt(energyData.TimeStamp, 16) + Jan12000;\
\
   var demand =  parseInt(energyData.Demand, 16) * parseInt(energyData.Multiplier, 16) / parseInt(energyData.Divisor, 16);\
  \
   /* get price */\
   json = UrlFetchApp.fetch(url, options_price).getContentText();\
   energyData = JSON.parse(json);\
   energyData = energyData.PriceCluster;\
\
   var price = parseInt(energyData.Price, 16) / 1000;\
   props.setProperty( "eInst", demand);\
   props.setProperty( "eTime", time); \
   props.setProperty( "ePrice", price);\
   sendEnergyToHub(time, demand, price);\
   return demand;\
\}\
\
function eInst() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('eInst'));\
\}\
function eTime() \{\
  return Date(Number(PropertiesService.getScriptProperties().getProperty('eTime')));\
\}\
function ePrice() \{\
  return Number(PropertiesService.getScriptProperties().getProperty('ePrice'));\
\}\
}