/**
 * 
 */
/****************************************************************************************************************
 **  DeviceHub data service
 */
function sendWeatherStationToHub() {
  var url = getSecureVal("DeviceHub", "URL");
  var headers =
   {     
     "Content-Type": "application/json",
     "X-ApiKey": getSecureVal("DeviceHub", "M2XAKEY"),
     "Accept":    "*/*"
   };
  var APISKEYEM = getSecureVal("DeviceHub", "M2XSKEY");
  var demandUrl = url + "v2/project/4131/device/" + APISKEYEM + "/sensor/EnergyMonitor/data";
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
  
  var priceUrl = url + "v2/project/4131/device/" + APISKEYEM + "/sensor/EnergyPrice/data";
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
  var json = UrlFetchApp.fetch(priceUrl, priceOptions).getContentText();
}
  

function sendEnergyToHub(time, demand, price) {
  var url = getSecureVal("DeviceHub", "URL");
  var APISKEYEM = getSecureVal("DeviceHub", "M2XSKEY");
  var headers =
   {     
     "Content-Type": "application/json",
     "X-ApiKey": getSecureVal("DeviceHub", "M2XAKEY"),
     "Accept":    "*/*",
   };
  var demandUrl = url + "v2/project/4131/device/" + APISKEYEM + "/sensor/EnergyMonitor/data";
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
  var priceUrl = url + "v2/project/4131/device/" + APISKEYEM + "/sensor/EnergyPrice/data";
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
