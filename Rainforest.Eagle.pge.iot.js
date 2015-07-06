/*
      Service:  Rainforest.com (makes the Rainforest Eagle Zigbee smart meter power monitor)
      Device:  Rainforest Eagle Zigbee smart meter power monitor     
      Service:  PGE for historical data, rate data  NOT used at this time

     The rainforest eagle can respond to API locally or through a proxy service in the cloud which effectively acts as a smart DNS
     The rainforest eagle can get instantaneous demand for electricity as well as cumulative demand.  You can ask for current pricing for power and 
       characteristics of the pricing zone.  You can also ask historical questions of the service which keeps some data on the Eagle and some in the services
       The eagle can talk to a number of vendors who can take the data and help you analyze your data usage.  I also hook the Eagle to Biggely which so far
      has not provided very good analytics
       The Eagle seems fairly robust and there are many modes it has for supporting how fast it polls the meter
           
     getEnergyStatsData() polls the Eagle and gets the latest information
        sets Google properties to use in spreadsheets and also sends information to Devicehub.net and ATT M2X
     sendEnergyToHub(time, demand, price)   sends data to devicehub.net
      setEnergyDataATT()   sends data to ATT M2X
    eInst()  these functions are available in spreadsheets to use for calculations or presentations
    eTime() 
    ePrice() 
 */


    
function sendEnergyToHub(time, demand, price) {
  var url = "https://api.devicehub.net/"; 
  var headers =
   {     
     "Content-Type": "application/json",
     "X-ApiKey": "{api_key}",
     "Accept":    "*/*",
   };

  var demandUrl = url + "v2/project/4131/device/{device_key}/sensor/EnergyMonitor/data";
  var demandPayload = 
      { "timestamp": time,
       "value":    demand,
      };
   var demandOptions =
   {
     "method" : "post",
     "headers" : headers,
     "muteHttpExceptions": true,
     "payload" : demandPayload,
   };

   
  var json = UrlFetchApp.fetch(demandUrl, demandOptions).getContentText();
  
  var priceUrl = url + "v2/project/4131/device/{device_key}/sensor/EnergyPrice/data";
  var pricePayload = 
      { "timestamp": time,
       "value":    price,
      };
   var priceOptions =
   {
     "method" : "post",
     "headers" : headers,
     "muteHttpExceptions": true,
     "payload" : pricePayload,
   };
  Logger.log(priceOptions); 
  
  var json = UrlFetchApp.fetch(priceUrl, priceOptions).getContentText();

}


function setEnergyDataATT()
{
  var wsApiKey = "{api_key}"
  var streams = [ "ePrice", "eInst", "eCumm",
                ];
  var headers =
   {     
     "Content-Type": "application/json",
     "X-M2X-KEY" : "{m2x_key}",    
      "Accept":    "*/*",
   }
           
  for (var i=0; i<streams.length; i++) {
     var updateWs = "https://api-m2x.att.com/v2/devices/" + wsApiKey + "/streams/" + streams[i] + "/value";
     var payload = {
        "value": PropertiesService.getScriptProperties().getProperty(streams[i])
     }; 
      var attWriteOptions =
     {
     "method" : "put",
     "headers" : headers,
     "muteHttpExceptions": true,
     "payload": payload,
     };
     Logger.log(updateWs);
     Logger.log(attWriteOptions);
     var json = UrlFetchApp.fetch(updateWs, attWriteOptions).getContentText();
     Logger.log(json);
     Utilities.sleep(1000);
}
}


/**
 *     Rainforest Eagle Energy Meter Data
 */
function getEnergyStatsData() {
 
  /* var url = "https://proactivechoice.ddns.net:9030/"; */
  var url = "https://rainforestcloud.com:9445/cgi-bin/post_manager";
  var getDemand = "nr<Command>nr<Name>get_instantaneous_demand</Name>nr<MacId>{mac_id}</MacId>nr<Format>JSON</Format>nr</Command>nr";
  var getPrice = "nr<Command>nr<Name>get_price</Name>nr<MacId>{mac_id}</MacId>nr<Format>JSON</Format>nr</Command>nr";

  var headers =
   {     
     "Accept": "*/*",
     "Content-Type": "text/xml",
     "User" : "{email}",
     "Cloud-Id" : "{cloud_id}",
     "Password" : "{password}",
     "Connection" : "keep-alive",
     "Pragma" : "no-cache",
     "Cache-Control" : "no-cache"
   };
   
   var options_demand =
   {
     "method" : "post",
     "headers" : headers,
     "payload" : getDemand
   };

  var options_price =
   {
     "method" : "post",
     "headers" : headers,
     "payload" : getPrice
   };

   /* fetch inst demand */
   var props = PropertiesService.getScriptProperties();
   var json = UrlFetchApp.fetch(url, options_demand).getContentText();
   var energyData = JSON.parse(json);
   energyData = energyData.InstantaneousDemand;
   Logger.log(energyData);
   Jan12000 = 946684800; /* Jan 1, 2000 */
  
   var time = parseInt(energyData.TimeStamp, 16) + Jan12000;

   var demand =  parseInt(energyData.Demand, 16) * parseInt(energyData.Multiplier, 16) / parseInt(energyData.Divisor, 16);
  
   /* get price */
   json = UrlFetchApp.fetch(url, options_price).getContentText();
   energyData = JSON.parse(json);
   energyData = energyData.PriceCluster;

   var price = parseInt(energyData.Price, 16) / 1000;
   props.setProperty( "eInst", demand);
   props.setProperty( "eTime", time); 
   props.setProperty( "ePrice", price);
   sendEnergyToHub(time, demand, price);
   return demand;
}

function eInst() {
  return Number(PropertiesService.getScriptProperties().getProperty('eInst'));
}
function eTime() {
  return Date(Number(PropertiesService.getScriptProperties().getProperty('eTime')));
}
function ePrice() {
  return Number(PropertiesService.getScriptProperties().getProperty('ePrice'));
}
