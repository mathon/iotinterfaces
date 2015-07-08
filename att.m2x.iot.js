/**
 * 
 */

 /****************************************************************************************************************
 **  ATT M2X data service
var payload = { 
    "values":  { 
       "outdoorCur": [{ "value": PropertiesService.getScriptProperties().getProperty('outdoorCur') }],
       "outdoorMax": [{ "value": PropertiesService.getScriptProperties().getProperty('outdoorMax') }], 
       "outdoorMin": [{ "value": PropertiesService.getScriptProperties().getProperty('outdoorMin') }],
    }
        }; 
*/ 
function sendDataATT(device, streams) {
  var apiKey = getSecureVal(device, "M2XAKEY");
  var streamKey = getSecureVal(device, "M2XSKEY");
  var props = PropertiesService.getScriptProperties();
  var headers =
   {     
     "Content-Type": "application/json",
     "X-M2X-KEY" : streamKey,    
      "Accept":    "*/*",
   }
  var payloadStr = '{"values":{';
  var url = getSecureVal("M2X", "URL");
  for (var i=0; i<streams.length; i++) {
     if(i > 0) payloadStr = payloadStr + ",";
     var updateUrl =  url + apiKey + "/streams/" + streams[i] + "/value";
    payloadStr = payloadStr + streams[i]+':[{"value":'+props.getProperty(streams[i])+"}]";
     var payload = {
        "value": props.getProperty(streams[i])
     }; 
     var attWriteOptions =
     {
       "method" : "put",
       "headers" : headers,
       "muteHttpExceptions": true,
       "payload": payload,
     };
     /*var response = UrlFetchApp.fetch(updateUrl, attWriteOptions).getContentText();
     attJSON = JSON.parse(response);
     if(attJSON.status != "accepted") Logger.log("ATT: "+streams[i]+" rejected value: "+props.getProperty(streams[i]));
     Utilities.sleep(1000);*/
  }
  payloadStr = payloadStr + "}}";
  updateUrl = url + "/devices/" + apiKey + "/updates";
  var attWriteOptions =
     {
       "method" : "post",
       "headers" : headers,
       "muteHttpExceptions": true,
       "payload": payloadStr,
     };
  Logger.log(updateUrl);
  Logger.log(attWriteOptions);
  var response = UrlFetchApp.fetch(updateUrl, attWriteOptions).getContentText();
  Logger.log(response);
  attJSON = JSON.parse(response);
  Logger.log(attJSON);
  if(attJSON.status != "accepted") Logger.log("ATT: "+streams+" rejected" );
}