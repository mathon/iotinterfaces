/*
 *        Device:   Tesla Model S
	Service:   Tesla Proxy

	The main data expected from the Tesla:

 	BatteryLevel
	Dfh (distance from home)
	Locked
           Precondition
	Close Windows
	Camera
	Geofence
	GPS Destination
	Charge
	Distance to Closest ChaDemO
	
	
 */
/****************************************************************************************************************
 *     Tesla for car
 */
function getTeslaData() {
  var batterypctlow = 0.30;
  var url = getSecureVal("Tesla", "URL");

  /* login Tesla */
  var securityToken = teslaLogin();

  /* get Teslas */
  var getDevices = url + "api/1/vehicles";
  response = UrlFetchApp.fetch(getDevices).getContentText(); 
  teslaJSON = JSON.parse(response);
  Logger.log(teslaJSON);
  
  for (i = 0; i< teslaJSON.response.length; i++) {
    var car = teslaJSON.response[i];
    teslaState = car.state;
    teslaId = car.id;
    teslaIndex = i;
  }
  
  var getLoc = url + "api/1/vehicles/" + teslaId + "/data_request/drive_state";
  response = UrlFetchApp.fetch(getLoc).getContentText(); 
  teslaJSON = JSON.parse(response);
  car = teslaJSON.response;
  Logger.log(teslaJSON);
  var teslaDfh = getMilesFromHome(car.lattitude, car.longitude);
  var teslaLon = car.longitude;  
  var teslaLat = car.lattitude;
  
  var getCharge = url + "api/1/vehicles/" + teslaId + "/data_request/charge_state";
  response = UrlFetchApp.fetch(getDevices).getContentText(); 
  teslaJSON = JSON.parse(response);
  car = teslaJSON.response;
  Logger.log(teslaJSON);
  var teslaBattery = car.battery_level;
  var teslaUsable = car.usable_battery_level;
  var teslaPhase = car.charge_phases;
  var teslaMaxRangeCount = car.max_range_charge_counter;
  
  /* compute time battery below low level */
  if( teslaBattery < batterypctlow) {
    var teslaBatteryLowTime = Number(PropertiesService.getScriptProperties().getProperty('teslaBatteryLowTime'));
    if( teslaBatteryLowTime == 0) teslaBatteryLowTime = new Date();
  } else
    var teslaBatteryLowTime = 0;
  
  var getClimate = url + "api/1/vehicles/" + carId + "/data_request/climate_state";
  response = UrlFetchApp.fetch(getClimate).getContentText(); 
  teslaJSON = JSON.parse(response);
  car = teslaJSON.response;
  Logger.log(teslaJSON);
  var telsaInsideTemp = car.inside_temp;
  var teslaOutsideTemp = car.outside_temp;
  
  /* set google properties */
  props.setProperties( { "teslaInsideTemp": teslaInsideTemp, 
                         "teslaOutsideTemp": teslaOutsideTemp, 
                         "teslaBattery": teslaBattery, 
                         "teslaBatteryLowTime": teslaBatteryLowTime, 
                         "teslaUsable": teslaUsable, 
                         "teslaPhase": teslaPhase, 
                         "teslaMaxRangeCount": teslaMaxRangeCount, 
                         "teslaDfh": teslaDfh, 
                         "teslaLon": teslaLon, 
                         "teslaLat": teslaLat,                        
                       } );


  /* send to ATT M2X*/
  var streams = [ "teslaInsideTemp", "teslaOutsideTemp", "teslaBattery", "teslaBatteryLowTime", 
                  "teslaUsable", "teslaPhase", "teslaMaxRangeCount", "teslaDfh", "teslaLon", "teslaLat",
                ];
  sendDataATT("Tesla", streams);
  logProps(streams);
}
                 
function teslaLogin() {
  var url = getSecureVal("Tesla", "URL");
  var clientSecret = getSecureVal("Tesla", "APIKEY"); 
  var clientId = getSecureVal("Tesla", "USERNAME");
  var username = getSecureVal("Tesla", "EMAIL");
  var password = getSecureVal("Tesla", "PASSWORD");
  var getSecToken = url + "oauth/token/grant_type=password&client_id=" + clientId + "&client_secret=" + clientSecret + "&email=" + username + "&password=" + password;

  var teslaLoginCmd = {
      "client_id" : clientId,  
  };
   var headers = { 
       "Content-Type": "application/json", 
   };
   var teslaOptions =
   {
     "method" : "post",
     "headers" : headers,
     "muteHttpExceptions": true,
     "payload" : teslaLoginCmd,
   };
  
   /* get security token */
  for (var i = 0; i<3 && securityToken == null; i++) {
   var response = UrlFetchApp.fetch(getSecToken).getContentText();
   Logger.log(response);
   var teslaJson = JSON.parse(response);
   securityToken = teslaJSON.access_token;
  }
  Logger.log(securityToken);
}


function teslaCommand(command) {
   var teslaCpayload = {
      "client_id" : getSecureVal("Tesla", "USERNAME"),  
  };
   var headers = { 
       "Content-Type": "application/json", 
   };
   var teslaOptions =
   {
     "method" : "get",
     "headers" : headers,
     "muteHttpExceptions": true,
     "payload" : teslaCpayload,
   };
  var baseUrl = getSecureVal("Tesla", "URL") + "api/1/vehicles/1/command/";
  response = UrlFetchApp.fetch(baseUrl + command).getContentText(); 
  teslaJSON = JSON.parse(response);
  car = teslaJSON.response;
  Logger.log(teslaJSON);
  
  return response.response;
}

function teslaSetMaxRange() {
  /* set charging to maximum */
  teslaWakeUp();
  teslaCommand("charge_max_range");
}

function teslaWakeUp() {
  var securityToken = teslaLogin();
  var wakeup = 0;
  /* wake up tesla */
  for (var i = 0; i < 3 && wakeup == 0; i++) {
    var response = teslaCommand("wake_up");
    Logger.log(response);
    wakeup = response.result;
  }
}

function teslaSetWarm() {
  /* set temp to warm temp and turn on pre-conditioning*/
  if ( Number(PropertiesService.getScriptProperties().getProperty('teslaInsideTemp')) < 23.3 /*74*/ && 
      Number(PropertiesService.getScriptProperties().getProperty('teslaBattery')) > 0.3) {
    teslaWakeUp();
    teslaCommand("set_temps?driver_temp=27&passenger_temp=27"); /* 81 */
    teslaCommand("auto_conditioning_start");
  }
}

function telsaSetCool() {
  /* set temp to cool temp and turn on pre-conditioning */
  if ( Number(PropertiesService.getScriptProperties().getProperty('teslaInsideTemp')) > 21.1 /*70*/ && 
      Number(PropertiesService.getScriptProperties().getProperty('teslaBattery')) > 0.3) {
    teslaWakeUp();
    teslaCommand("set_temps?driver_temp=16&passenger_temp=16");
    teslaCommand("auto_conditioning_start");
  }
}

function teslaAnnounce() {
  /* honk horn, flash lights, open trunk */
  var d = new Date();
  var TOD = d.getTime().gethours();
  teslaWakeUp();
  teslaCommand("honk_horn");
  teslaCommand("trunk_open");
  if ( TOD > 19 ) {
    teslaCommand("flash_lights");
  }
  Utilities.sleep(10000);  /* sleep for 10 seconds */
  teslaCommand("honk_horn");
    if ( TOD > 19 ) {
    teslaCommand("flash_lights");
  }
}

function teslaOpenStart() {
  /* precondition, start car, unlock */
  var password = getSecureVal("Tesla", "PASSWORD");
  teslaWakeUp();
  teslaCommand("door_unlock");
  teslaCommand("remote_start_drive?password=" + password);
}

function getTeslaService() {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('Tesla')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://owner-api.teslamotors.com/oauth/auth')
      .setTokenUrl('https://accounts.google.com/oauth/token')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId('...')
      .setClientSecret('...')

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to request (space-separated for Google services).
      .setScope('https://www.googleapis.com/auth/drive')

      // Below are Google-specific OAuth2 parameters.

      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline')

      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      .setParam('approval_prompt', 'force');
}