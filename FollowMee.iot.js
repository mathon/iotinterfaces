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

/****************************************************************************************************************
 **
 **   FollowMee Service
 */
function getProximityData() {

   var url = getSecureVal("Followmee", "URL");
   var json = UrlFetchApp.fetch(url).getContentText();
   var fmData = JSON.parse(json);
   var positions = fmData.Data.length;
   var props = PropertiesService.getScriptProperties();
   var dThresh = [0.4,     1.2,     4,       20,     100,     100 ];
   var dName =   ["Home", "Near", "Area", "Return", "Vacation", "Out"];
   var dNum =    [ 0,       1,       2,      3,      5,       4];
   var dMode =   [ -1.      -1,      -1,     0,      1,       1];
   var dSig = 4; /* distance to determine if I am going home */
   var tSig = 10; /* time for the distance */
  
   /* for each device get location and compute distance from home
       Using the table above determine where I am relative to home
   */
   for (var i = 0; i<positions; i++) {
     var gh = "";
     var Loc = -1;
     var dev = "fm" + String(i);

     /* basic properties */ 
     props.setProperty( dev + "Name", fmData.Data[i].DeviceName);
     var dfh = getMilesFromHome(fmData.Data[i].Latitude, fmData.Data[i].Longitude);
     props.setProperty( dev + "Dfh", dfh); 
     var time = returnDate(fmData.Data[i].Date);
     props.setProperty( dev + "Time", time); 

     /* computed properties */
     Ldfh = PropertiesService.getScriptProperties().getProperty(dev + "Ldfh");
     Ltime = returnDate(props.getProperty(dev + "Ltime"));

     Logger.log(time);
     Logger.log(Ltime);
     for (var j=0; j<dNum.length; j++) {
       if(dMode[j] > 0) {
         if (dfh > dThresh[j]) {
           gh = dName[j]; 
           Logger.log(gh);
           Loc = dNum[j];
           Ldfh = dfh;
           Ltime = time;
           break;
          };
       } else if(dMode[j] < 0) {
         if (dfh < dThresh[j])
           gh = dName[j]; 
           Logger.log(gh);
           Loc = dNum[j];
           Ldfh = dfh;
           Ltime = time;
           break;
       } else {  /* 0 = test if coming home */
         if ( Ldfh == null || Ldfh <= dfh || dfh > dThresh[j]) { /* no previous dfh or moving away */
           Ldfh = dfh;
           Ltime = time;
         } else if (Ldfh - dSig <= dfh ) {  /* I have moved closer to home substantially */ 
           Logger.log("Moved Closer to home");
           /* if the time is < ght then I am going home */
           if (time - Ltime < tSig) {
             gh = dName[j];
             Loc = dNum[j];
             Logger.log(dName[j]);
             Ltime = 60*60*25;
             break;
           } 
         }
       }
       Ltime = time;
     }
     props.setProperty( dev + "Ldfh", Ldfh);
     props.setProperty( dev + "Gh", gh);
     props.setProperty( dev + "Loc", Loc);
     props.setProperty( dev + "Ltime", Ltime);    
  
   }
  /* send to ATT M2X*/
  var streams = [ "fm0Name", "fm0Dfh", "fm0Time", "fm0Ldfh", "fm0Ltime", "fm0Gh", "fm0Loc",
                ];
  sendDataATT("Followmee", streams);
  logProps(streams);           
  return fmData.Data[0].Date;
}

function toRad(Value) {
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}

/**
 *      getMilesFromHome
 */
function getMilesFromHome(lat2, lon2) {
   var lat1 = 37.531578;
   var lon1 = -122.341736;
   var R = 3958.7558657440545; /* miles or 6371000 metres */
   var φ1 = toRad(lat1);
   var φ2 = toRad(lat2);
   var Δφ = toRad(lat2-lat1);
   var Δλ = toRad(lon2-lon1);

var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2);
var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;  
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
}}