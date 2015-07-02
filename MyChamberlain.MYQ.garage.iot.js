{\rtf1\ansi\ansicpg1252\cocoartf1347\cocoasubrtf570
{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
\margl1440\margr1440\vieww17760\viewh19880\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural

\f0\fs24 \cf0 /**\
 *         The MYQ Garage Door System from Liftmaster / Chamberlain is an annoying system.  They have refused to provide API documentation \
           or help.   Scouring the Internet has resulted in this implementation.   \
\
         Device:   Liftmaster 8500 Single Myq garage door opener\
         Device:   Liftmaster wall control unit for GDO\
         Device:    Liftmaster Gateway provides hardwired internet connection and wireless to other lift master components\
         Service:   Myq required proxy service to get status of the door and to open or close\
\
         In addition I have (but have not integrated)\
         Device:   Honeywell 8511\
         Device:   Alarm\
         Device:   Tilt Sensor\
         as part of the Lynx 7000 security system and Z-wave support\
\
         The data format coming from the GDO and lift master components is quite complicated.   \
          getGarageData()   this function first goes to the Myq service and logs in getting a security token for subsequent calls\
                 it then asks for the device status for all the devices.   Somewhere in the data is the door state.\
                 this function also sends status and duration of the door being open to M2X as well as setting spreadsheet properties\
\
       setGarageATT()  send data to M2X\
       setGarageData(openClose)    sets the door to open or close\
\
 */\
\
\
/**\
 *     MyQ Chamberlin Garage\
 */\
function getGarageData() \{\
  var url = "http://myqexternal.myqdevice.com/";\
  var applicationId = "Vj8pQggXLhLy0WHahglCD4N1nAkkXQtGYpq2HrHD7H1nvmbT55KqtN6RSF4ILB%2fi";\
  var username = "jmha576%40gmail%2Ecom";\
  var password = "blue1sky";\
  var culture = "en";\
  var getSecToken = url + "Membership/ValidateUserWithCulture?appId=" + applicationId + \
      "&securityToken=null&username=" + username + "&password=" + password + "&culture=" + culture;\
\
  var securityToken = null;\
  \
   /* get security token */\
  for (var i = 0; i<3 && securityToken == null; i++) \{\
   var json = UrlFetchApp.fetch(getSecToken).getContentText();\
   var myqJSON = JSON.parse(json);\
   securityToken = myqJSON.SecurityToken;\
  \}\
\
  var getDevices = url + "api/UserDeviceDetails?appId=" + applicationId + "&securityToken=" + securityToken;\
  json = UrlFetchApp.fetch(getDevices).getContentText(); \
  myqJSON = JSON.parse(json);\
  var doorState = -1;\
  var doorTime = -1;\
  \
  for (var i=0; i<myqJSON.Devices.length; i++) \{\
    Logger.log("   Id:" + myqJSON.Devices[i].DeviceId + " Name:" + myqJSON.Devices[i].DeviceName);\
    var attr = myqJSON.Devices[i].Attributes;\
    for (var j = 0; j<attr.length; j++) \{\
      if ( attr[j].MyQDeviceTypeAttributeId == 61)\
         Logger.log("      Name:" + attr[j].Name + " Id:" + attr[j].MyQDeviceTypeAttributeId + " Value:" + Date(attr[j].Value));\
      else\
         Logger.log("      Name:" + attr[j].Name + " Id:" + attr[j].MyQDeviceTypeAttributeId + " Value:" + attr[j].Value);\
    \}\
  \}\
  \
  var devices = myqJSON.Devices[0].Attributes;\
  Logger.log(devices);\
  for (i = 0; i < devices.length; i++) \{\
    if(devices[i].Name == "doorstate") \{\
      doorState = devices[i].Value;\
      doorTime = devices[i].UpdatedTime;\
      break;\
    \}\
  \}\
  Logger.log(doorState);\
  var props = PropertiesService.getScriptProperties();\
  var goTime = Number(PropertiesService.getScriptProperties().getProperty('goTime'));\
  if(gTime == null) gTime = 0;\
  if (doorState != -1) \{\
    if(doorState == 1) \{\
      props.setProperty( "gDoor", "Open");\
      if(goTime == null || goTime == 0) \{\
        props.setProperty( "goTime", doorTime);\
        props.setProperty( "goDur", 0);\
      \} else \
        props.setProperty( "goDur", doorTime - goTime );\
    \} else \{\
      props.setProperty( "gDoor", "Closed");\
      props.setProperty( "goTime", 0);\
      props.setProperty( "goDur", 0);\
    \}\
  \}\
  setGarageATT();\
\
\}\
\
function setGarageATT()\
\{\
  var wsApiKey = "af9bcba09a8dd67e92467b1ab50e5b72";\
  var streams = [ "gDoor" , "goTime", "goDur",    \
                ];\
  var headers =\
   \{     \
     "Content-Type": "application/json",\
     "X-M2X-KEY" : "87dee4a4b30de219e18bc08f0e790254",    \
      "Accept":    "*/*",\
   \}\
           \
  for (var i=0; i<streams.length; i++) \{\
     var updateWs = "https://api-m2x.att.com/v2/devices/" + wsApiKey + "/streams/" + streams[i] + "/value";\
     propVal = PropertiesService.getScriptProperties().getProperty(streams[i]);\
     if(propVal == null) propVal = 0;\
     var payload = \{\
        "value": propVal,\
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
\}\
\}\
\
\
function getDoorState() \{\
    return PropertiesService.getScriptProperties().getProperty('gDoorState');\
\}\
\
function setGarageData(openClose) \{\
  var url = "https://myqexternal.myqdevice.com/";\
  var applicationId = "Vj8pQggXLhLy0WHahglCD4N1nAkkXQtGYpq2HrHD7H1nvmbT55KqtN6RSF4ILB%2fi";\
  var username = "jmha576%40gmail%2Ecom";\
  var password = "blue1sky";\
  var culture = "en";\
  var getSecToken = url + "Membership/ValidateUserWithCulture?appId=" + applicationId + \
      "&securityToken=null&username=" + username + "&password=" + password + "&culture=" + culture;\
\
  var securityToken = null;\
  \
   /* get security token */\
  for (var i = 0; i<3 && securityToken == null; i++) \{\
   var json = UrlFetchApp.fetch(getSecToken).getContentText();\
   var myqJSON = JSON.parse(json);\
   securityToken = myqJSON.SecurityToken;\
  \}\
\
\
  var props = PropertiesService.getScriptProperties();\
  var deviceId = 285247443;/* 1531357 or 285247443 or 33719633 or 1530196 or GW000003FD59 */;\
  \
  var doorToState = 0;\
  if (openClose == "Open") doorToState = 1;\
\
  var doorState = \{\
      "DeviceId" : deviceId,\
      "ApplicationId" : applicationId,  \
      "AttributeName" : "desireddoorstate",\
      "AttributeValue" : doorToState,\
      "SecurityToken" : securityToken, \
      "Content-Type": "application/json", \
  \};\
   var headers = \{     \
     /* "User-Agent": "2/1332 (iPhone; iOS 7.1.1; Scale/2.00)", */\
\
   \};\
   var optionsClose =\
   \{\
     "method" : "PUT",\
     "headers" : headers,\
     "muteHttpExceptions": true,\
     "payload" : doorState,\
   \};\
  var postDevices = url + "Device/setDeviceAttribute";  /* deviceattribute/putdeviceattribute/ */\
  Logger.log(postDevices);\
  Logger.log(optionsClose);\
  json = UrlFetchApp.fetch(postDevices, optionsClose).getContentText(); \
  myqJSON = JSON.parse(json);\
  Logger.log(myqJSON);\
 \
\}\
\
function setGarageDoorOpen() \{\
  setGarageData("Open");\
\}\
function setGarageDoorClose() \{\
  setGarageData("Close");\
\}\
\
\
\
}