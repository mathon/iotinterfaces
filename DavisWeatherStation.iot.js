/*

 *    Application:  Weathersnoop 3 
      Device:  Davis Vantage Vue Weather Station
      Device:  Davis Weather Envoy
      Device:  Davis Extra Temperature Sensor


        connected to a weather station in this case a Davis Vantage Vue
        through a Davis Weather Envoy plugged into a MacMini USB port
      Weathersnoop can be enabled to produce a web service which this API polls
      API to weathersnoop:  
      Davis Info:
      Data is published to:   google properties, Devicehub.net and ATT M2X for data collection
      For purposes of Monitoring and Automation I need only the max, min, current values for
         indoor, outdoor temps, pool temperature and gusting wind speed as well as rain detection
      attached my pool sensor to extraTemperature 2 through a Davis extra temperature sensor box.
      Weathersnoop doesn'92t know how to detect extra box and neither does Davis software on a mac. 
          To get extra sensor to work requires use of a windows PC and Davis Windows software
      I use port forwarding through my router to gain access to the Mac mini running weather snoop 
      I use no-ip.com to get dynamic IP routing
      
     getWeatherStationData()  gets all the weather station data, sets google properties and publishes
       ATT M2X
    setWeatherStationData() sends google properties to ATT M2X IOT Platform
    spreadsheet functions supported so that automation can be built directly into a spreadsheet
    sendWeatherStationToHub() sends data to Devicehub.net
      
 */
}/****************************************************************************************************************

 * 
 */
function getWeatherStationData() {

   var url = getSecureVal("Davis", "URL");
   var json = UrlFetchApp.fetch(url).getContentText();
   var weatherData = JSON.parse(json);

   if( weatherData == null) {
    var status = "StationDown";
    Logger.log(status);
    props.setProperties( { "wsStatus": status } );
    return status;
   }
   var props = PropertiesService.getScriptProperties();
   props.setProperties( { 'wsTime': weatherData.site.time } );
   

  /* Pool Data */
   var wsPoolCur = weatherData.site.properties.extraTemperature2.values[0].value;
   var wsPoolMax = weatherData.site.properties.extraTemperature2.maxValueToday.values[0].value;
   var wsPoolMin = weatherData.site.properties.extraTemperature2.minValueToday.values[0].value;
   props.setProperties( { 'wsPoolCur': wsPoolCur, 'wsPoolMax': wsPoolMax, 'wsPoolMin': wsPoolMin } );

  /* Outdoor Temperature */
   var outdoorCur = weatherData.site.properties.outdoorTemperature.values[0].value;
   var outdoorMax = weatherData.site.properties.outdoorTemperature.maxValueToday.values[0].value;
   var outdoorMin = weatherData.site.properties.outdoorTemperature.minValueToday.values[0].value;
   props.setProperties( { 'outdoorCur': outdoorCur, 'outdoorMax': outdoorMax, 'outdoorMin': outdoorMin } );

   /* Outdoor Temperature */
   var indoorCur = weatherData.site.properties.indoorTemperature.values[0].value;
   var indoorMax = weatherData.site.properties.indoorTemperature.maxValueToday.values[0].value;
   var indoorMin = weatherData.site.properties.indoorTemperature.minValueToday.values[0].value;
   props.setProperties( { 'indoorCur': indoorCur, 'indoorMax': indoorMax, 'indoorMin': indoorMin } );

   /* Wind Speed 
   choices :  windspeed, tenMinuteAverageWindSpeed, twoMinuteAverageWindSpeed, tenMinuteWindGust
                rainRate, dayRain, uvIndex, solarRadiation, transmitterBatteryStatus, consoleBatteryVoltage
   */
   var windSpeed = weatherData.site.properties.tenMinuteWindGust;
   var windSpeedCur = windSpeed.values[0].value;
   var windSpeedMax = windSpeed.maxValueToday.values[0].value;
   var windSpeedMin = windSpeed.minValueToday.values[0].value;
   props.setProperties( { 'windSpeedCur': windSpeedCur, 'windSpeedMax': windSpeedMax, 'windSpeedMin': windSpeedMin } );
  
   /* rainRate, dayRain
   , uvIndex, solarRadiation
   , transmitterBatteryStatus, consoleBatteryVoltage
   */
   var windSpeed = weatherData.site.properties.tenMinuteWindGust;
   var windSpeedCur = windSpeed.values[0].value;
   var windSpeedMax = windSpeed.maxValueToday.values[0].value;
   var windSpeedMin = windSpeed.minValueToday.values[0].value;
   props.setProperties( { 'windSpeedCur': windSpeedCur, 'windSpeedMax': windSpeedMax, 'windSpeedMin': windSpeedMin } );

  var transmitterBatteryStatus = weatherData.site.properties.transmitterBatteryStatus.values[0].value;
  var consoleBatteryVoltage = weatherData.site.properties.consoleBatteryVoltage.values[0].value;
  if(transmitterBatteryStatus < 3 || consoleBatteryVoltage < 3) {
    Logger.log(transmitterBatteryStatus);
    Logger.log(consoleBatteryVoltage);
    Logger.log("Batteries need replacing");
    props.setProperties( { 'wsStatus': "BatteryLow" } );
  }
  
  var dayRain = weatherData.site.properties.dayRain.values[0].value;
  var rainRate = weatherData.site.properties.rainRate.maxValueToday.values[0].value;
  props.setProperties( { 'dayRain': dayRain, 'rainRate': rainRate } );

  /* send to ATT M2X*/
  var streams = [ "outdoorCur", "outdoorMax", "outdoorMin",
                  "indoorCur", "indoorMax", "indoorMin",
                  "windSpeedCur", "windSpeedMax", "windSpeedMin",
                  "wsPoolCur", "wsPoolMax", "wsPoolMin",
                  "wsStatus", "rainRate", "dayRain",
                ];   
  logProps(streams);
  sendDataATT("Davis", streams);

  return new Date();
}
              


