/*
 *          Belkin Wemo switches and lights
 */
/**
 * 
 */
/****************************************************************************************************************
 *     WeMo for switches and lights
 */
function getWeMoData() {
  var wemoHeaders = { 
      "Content-Type": "application/json", 
      "SOAPACTION": "urn:Belkin:service:basicevent:1#GetBinaryState",
    };
  var wemoState = '<?xml version="1.0" encoding="<utf-8"?>>' + 
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/>' +
          "<s:Body>" + 
            '<u:GetBinaryState xmlns:u="urn:Belkin:service:basicevent:1>' + 
             "<BinaryState>1</BinaryState>" + 
             "</u:GetBinaryState>" + 
            "</s:Body>" + 
          "</s:Envelope>"
  var wemoOptions =
    {
     "method" : "post",
     "headers" : wemoHeaders,
     "muteHttpExceptions": true,
     "payload" : wemoState,
    };

  var ddnsDevices = [ "WemoXmas", "WemoGazebo" ];
  props.setProperty( "weNum", ddnsDevices.length ); 
  
  for (var i = 0; i < ddnsDevices.length; i++) {
    var response = UrlFetchApp.fetch(getSecureVal(ddnsDevices[i], "URL") + "/upnp/control/basicevent1").getContentText();
    Logger.log(response);
    var wemoJson = JSON.parse(response);
    state = wemoJSON.BinaryState;
    props.setProperties( "we" + String(i), state ); 
      /* send to ATT M2X*/
    var streams = [ "we0", "we1", "we2", "we3" ];
    sendDataATT(ddnsDevices[i], streams);
    logProps(streams);
  }
  
}