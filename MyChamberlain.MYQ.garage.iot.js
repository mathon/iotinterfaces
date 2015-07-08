/*
 *         The MYQ Garage Door System from Liftmaster / Chamberlain is an annoying system.  They have refused to provide API documentation 
           or help.   Scouring the Internet has resulted in this implementation.   

         Device:   Liftmaster 8500 Single Myq garage door opener
         Device:   Liftmaster wall control unit for GDO
         Device:    Liftmaster Gateway provides hardwired internet connection and wireless to other lift master components
         Service:   Myq required proxy service to get status of the door and to open or close

         In addition I have (but have not integrated)
         Device:   Honeywell 8511
         Device:   Alarm
         Device:   Tilt Sensor
         as part of the Lynx 7000 security system and Z-wave support

         The data format coming from the GDO and lift master components is quite complicated.   
          getGarageData()   this function first goes to the Myq service and logs in getting a security token for subsequent calls
                 it then asks for the device status for all the devices.   Somewhere in the data is the door state.
                 this function also sends status and duration of the door being open to M2X as well as setting spreadsheet properties

       setGarageATT()  send data to M2X
       setGarageData(openClose)    sets the door to open or close

 */

/****************************************************************************************************************
 *     MyQ Chamberlin Garage
 */
function getGarageData() {

  var url = getSecureVal("Myq", "URL");
  var securityToken =  getMyqSecurityToken();
  var applicationId = getSecureVal("Myq", "APIKEY");
  var getDevices = url + "api/UserDeviceDetails?appId=" + applicationId + "&securityToken=" + securityToken;

  /* get devices */
  json = UrlFetchApp.fetch(getDevices).getContentText(); 
  myqJSON = JSON.parse(json);
  var props = PropertiesService.getScriptProperties();
  
  for (var i=0; i<myqJSON.Devices.length; i++) {
    Logger.log("   Id:" + myqJSON.Devices[i].DeviceId + " Name:" + myqJSON.Devices[i].DeviceName);
    var attr = myqJSON.Devices[i].Attributes;
    for (var j = 0; j<attr.length; j++) {
      if ( attr[j].MyQDeviceTypeAttributeId == 61)
         Logger.log("      Name:" + attr[j].Name + " Id:" + attr[j].MyQDeviceTypeAttributeId + " Value:" + Date(attr[j].Value));
      else
         Logger.log("      Name:" + attr[j].Name + " Id:" + attr[j].MyQDeviceTypeAttributeId + " Value:" + attr[j].Value);
      if ( attr[j].MyQDeviceTypeAttributeId == 49 ) {
        var deviceId = myqJSON.Devices[i].DeviceId; /*attr[j].Value*/;
        Logger.log(deviceId);
        props.setProperty( "myqDeviceId", deviceId);
      }
      if ( attr[j].Name == "doorstate" ) {
        var doorState = attr[j].Value;
        var doorTime = attr[j].UpdatedTime;
        Logger.log(doorState);
        Logger.log(doorTime);
      }
    }
  }

  var goTime = Number(props.getProperty('goTime'));
  if(goTime == null) goTime = 0;
  if(doorState == 1) {
    props.setProperty( "gDoor", "Open");
    if(goTime == null || goTime == 0) {
      props.setProperty( "goTime", doorTime);
      Logger.log("Door Opened");
      props.setProperty( "goDur", 0);
    } else {
      Logger.log("Door Opened "+Date(goTime));
      props.setProperty( "goDur", (new Date() - goTime)/60000 );
    }
  } else {
    props.setProperty( "gDoor", "Closed");
    props.setProperty( "goTime", 0);
    props.setProperty( "goDur", 0);
  }
 
  /* send to ATT M2X*/
  var streams =  [ "gDoor" , "goTime", "goDur" ];
  sendDataATT("Myq", streams);
  logProps(streams);
}


function setGarageData(openClose) {
  var securityToken =  getMyqSecurityToken();
  var url = getSecureVal("Myq", "URL");
  var props = PropertiesService.getScriptProperties();  
  if (openClose == "Open") doorToState = 1;
    else var doorToState = 0;

  var doorState = {
    "AttributeName":"desireddoorstate",
    "DeviceId": props.getProperty('myqDeviceId'),
    "ApplicationId": getSecureVal("Myq", "APIKEY"),
    "AttributeValue": doorToState,
    "SecurityToken": securityToken, 
  };
   var headers = {     
     /* "User-Agent": "2/1332 (iPhone; iOS 7.1.1; Scale/2.00)", */
   };
   var optionsClose =
   {
     "method" : "put",
     "headers" : doorState,
     "muteHttpExceptions": true,
   };
  var postDevices = url + "Device/setDeviceAttribute";  /* deviceattribute/putdeviceattribute/ */
  Logger.log(postDevices);
  Logger.log(optionsClose);
  json = UrlFetchApp.fetch(postDevices, optionsClose).getContentText(); 
  myqJSON = JSON.parse(json);
  Logger.log(myqJSON);
  props.setProperty( "gDoor", openClose);
  props.setProperty( "goTime", doorToState);
  props.setProperty( "goDur", 0);

}

function setGarageDoorOpen() { setGarageData("Open"); }
function setGarageDoorClose() { setGarageData("Close"); }

function getMyqSecurityToken() {
  var url = getSecureVal("Myq", "URL");
  var applicationId = getSecureVal("Myq", "APIKEY");
  var username = getSecureVal("Myq", "USERNAME");
  var password = getSecureVal("Myq", "PASSWORD");
  var culture = "en";
  var getSecToken = url + "Membership/ValidateUserWithCulture?appId=" + applicationId + 
      "&securityToken=null&username=" + username + "&password=" + password + "&culture=" + culture;

  var securityToken = null;
  
   /* get security token */
  for (var i = 0; i<3 && securityToken == null; i++) {
   var json = UrlFetchApp.fetch(getSecToken).getContentText();
   var myqJSON = JSON.parse(json);
   return myqJSON.SecurityToken;
  }
  return null;
}