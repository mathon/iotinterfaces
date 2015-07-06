/*
 *    Service:  FollowMee 
      Device:  iPhone or iPad '85 Android devices or other mobile devices, even cars supported

      I use FollowMee to determine my distance from home and my direction of travel.  Ultimately the purpose of this is to decide 
	I am close to Home   (My GPS coords are within 1.0 miles from home coords)
           I am at Home            (My GPS coords are within 0.05miles from home coords)
           I am on Vacation far away   (My GPS coords are > 100 miles from home coords)
           I am not at home          (Any other situation falls into this)
           I am on the way home   (My GPS coords are moving N miles closer to home within the last M minutes)

       In order to do this I need to compute the great circle distance using formulas available 
       I need to do some tricky use of a few parameters to calculate my getting closer to home

       The data is sent to ATT M2X 
        fm0Name() the name of the 0th device being reported (allowing for multiple people in the household)  
        fm0Dfh()  the distance from home in miles
        fm0Time()  the time of the Dfh data
        fm0Ldfh()  the maximum distance I have been from home in the last M minutes
        fm0Ltime() the time of the maximum distance
        fm0Gh() my current state :  Home, Return, Out, Vacation, Close
      
 */



function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

/**
 *      getMilesFromHome
 */
function getMilesFromHome(lat2, lon2) {
   var lat1 = {home_lat};
   var lon1 = {home_lon};
   var R = 3958.7558657440545; /* miles or 6371000 metres */
   var uc0u966 1 = toRad(lat1);
   var uc0u966 2 = toRad(lat2);
   var uc0u916 u966  = toRad(lat2-lat1);
   var uc0u916 u955  = toRad(lon2-lon1);

var a = Math.sin(uc0u916 u966 /2) * Math.sin(u916 u966 /2) +
        Math.cos(uc0u966 1) * Math.cos(u966 2) *
        Math.sin(uc0u916 u955 /2) * Math.sin(u916 u955 /2);
var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
  
}

function fm0Name() {
  return PropertiesService.getScriptProperties().getProperty('fm0Name');
}
function fm0Dfh() {
  return Number(Number(PropertiesService.getScriptProperties().getProperty('fm0Dfh')));
}
function fm0Time() {
  return Number(PropertiesService.getScriptProperties().getProperty('fm0Time'));
}
function fm0Ldfh() {
  return Number(Number(PropertiesService.getScriptProperties().getProperty('fm0Ldfh')));
}
function fm0Ltime() {
  return Number(PropertiesService.getScriptProperties().getProperty('fm0Ltime'));
}
function fm0Gh() {
  return Number(PropertiesService.getScriptProperties().getProperty('fm0Gh'));
}


function setFollowMeeDataATT()
{
  var wsApiKey = "{API_Key}"
  var streams = [ "fm0Name", "fm0Dfh", "fm0Time", "fm0Ldfh", "fm0Ltime", "fm0Gh"
                ];
  var headers =
   {     
     "Content-Type": "application/json",
     "X-M2X-KEY" : "{m2x-key}",    
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
 *     Time Manip
 */
function returnDate(value) {
  if (value == null) return 0;
  else { 
         var hour = Number(value.slice(11,13));
         var min = Number(value.slice(14,16));
         var sec = Number(value.slice(17,19));
         return sec+(min + hour*60)*60;
       }
}

/**
 *     FollowMee 
 */
function getProximityData() {
   var url ="https://www.followmee.com/api/tracks.aspx?key={api_key}&username={username]&output=json&function=currentforalldevices";
   var json = UrlFetchApp.fetch(url).getContentText();
   var fmData = JSON.parse(json);
   var positions = fmData.Data.length;
   var props = PropertiesService.getScriptProperties();
   var ghd = 5; /* distance to determine if I am going home */
   var close = 1; /* distance to determine if I am close to home */
   var atHome = 0.10; /* distance to determine if I am at home */
   var ght = 10; /* time for the distance */
  
   /* for each device get location and compute distance from home
       if the distance from home is larger than previous distance from home then that is the new distance from home
       if the distance to home has moved more than 4 miles in 10 minutes then that device is coming home
       if the device is more than 4 miles from home then it is away
       if the device is > 100 miles from home it is on vacation
   */
   for (var i = 0; i<positions; i++) {
     var gh = 0;
     var dev = "fm" + String(i);

     /* basic properties */ 
     props.setProperty( dev + "Name", fmData.Data[i].DeviceName);
     var dfh = getMilesFromHome(fmData.Data[i].Latitude, fmData.Data[i].Longitude);
     props.setProperty( dev + "Dfh", dfh); 
     var time = returnDate(fmData.Data[i].Date);
     props.setProperty( dev + "Time", time); 

     /* computed properties */
     Ldfh = PropertiesService.getScriptProperties().getProperty(dev + "Ldfh");
     Ltime = returnDate(PropertiesService.getScriptProperties().getProperty(dev + "Ltime"));

     Logger.log(time);
     Logger.log(Ltime);
     if (dfh > 100) {
       Logger.log("On Vacation");
        gh = "Vacation"; /* on vacation */
        return;
     } else if (dfh < atHome) { /* I am already at home */
        gh = "Home";  /* at home */
        Ldfh = 0;
        Ltime = time;
    } else if (dfh < close) {
       gh = '93Close'94;  /* Close to home */
        Ldfh = 0;
        Ltime = time;
     } else if ( Ldfh == null || Ldfh <= dfh) { /* no previous dfh or moving away */
       Logger.log("No prev Ldfh");
        Ldfh = Ldfh;
        Ltime = time;
        gh = '93Out'94;
     } else if (Ldfh - ghd >= dfh ) {  /* I have moved closer to home substantially */ 
       Logger.log("Moved Closer to home");
       /* if the time is < ght then I am going home */
       if (time - Ltime <= ght) {   /* less time has elapsed since greatest distance measurement than the interval */
         gh = '93Return'94;
          Ltime = Ltime + 2000*60;   /* add 2 minutes */
          Ldfh = Ldfh - 1;  /* subtract a mile *.
       } else gh = "Out";

     } else gh = "Out";
     props.setProperty( dev + "Ldfh", Ldfh);
     props.setProperty( dev + "Gh", gh);
     props.setProperty( dev + "Ltime", Ltime);    
  }   
  setFollowMeeDataATT();
  return fmData.Data[0].Date;
}
}