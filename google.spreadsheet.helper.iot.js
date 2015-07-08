/**
 * 
 */
function getSecureVal(device, item) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var secureSheet = ss.getSheetByName("Security");
  var dRange = secureSheet.getRange(1, 1, 50);
  var dValues = dRange.getValues();
  var deviceCount = dValues[0][0];
  var pRange = secureSheet.getRange(1, 2, 1, 9);
  var pValues = pRange.getValues();
  var propCount = pValues[0][0];
  for (var i = 0; i<deviceCount; i++) {
    if (dValues[i+1][0] == device) {
      for (var j=0; j<propCount; j++) {
        if(pValues[0][j+1] == item) {
          var value = secureSheet.getSheetValues(i+2, j+3, 1, 1)[0][0];
          return value;
        }
      }
    }
  }
  return null;
}

function logProps(streams) {
  var props = PropertiesService.getScriptProperties();
  for (var i = 0; i < streams.length; i++) {
    Logger.log("LOG "+streams[i]+" : "+PropertiesService.getScriptProperties().getProperty(streams[i]));
  }
}

function IoT(stream) {
  return PropertiesService.getScriptProperties().getProperty(stream);
}


/**
 *  Weather Station Helper Functions
 */
function wsPoolCur() { return Number(PropertiesService.getScriptProperties().getProperty('wsPoolCur')); }
function wsPoolMax() { return Number(PropertiesService.getScriptProperties().getProperty('wsPoolMax')); }
function wsPoolMin() { return Number(PropertiesService.getScriptProperties().getProperty('wsPoolMin')); }

function outdoorCur() { return Number(PropertiesService.getScriptProperties().getProperty('outdoorCur')); }
function outdoorMax() { return Number(PropertiesService.getScriptProperties().getProperty('outdoorMax')); }
function outdoorMin() { return Number(PropertiesService.getScriptProperties().getProperty('outdoorMin')); }

function indoorCur() { return Number(PropertiesService.getScriptProperties().getProperty('indoorCur')); }
function indoorMax() { return Number(PropertiesService.getScriptProperties().getProperty('indoorMax')); }
function indoorMin() { return Number(PropertiesService.getScriptProperties().getProperty('indoorMin')); }

function windSpeedCur() { return Number(PropertiesService.getScriptProperties().getProperty('windSpeedCur')); }
function windSpeedMax() { return Number(PropertiesService.getScriptProperties().getProperty('windSpeedMax')); }
function windSpeedMin() { return Number(PropertiesService.getScriptProperties().getProperty('windSpeedMin')); }

function wsStatus() { return PropertiesService.getScriptProperties().getProperty('wsStatus'); }
function rainRate() { return Number(PropertiesService.getScriptProperties().getProperty('rainRate')); }
function dayRain() { return Number(PropertiesService.getScriptProperties().getProperty('dayRain')); }


/**
 *  WU today forecast Functions
 */
function wu0Max() { return Number(PropertiesService.getScriptProperties().getProperty('wu0Max')); }
function wu0Cond() { return PropertiesService.getScriptProperties().getProperty('wu0Cond'); }
function wu0Min() { return Number(PropertiesService.getScriptProperties().getProperty('wu0Min')); }
function wu0MaxWind() { return Number(PropertiesService.getScriptProperties().getProperty('wu0MaxWind')); }
function wu1Max() { return Number(PropertiesService.getScriptProperties().getProperty('wu1Max')); }
function wu1Cond() { return PropertiesService.getScriptProperties().getProperty('wu1Cond'); }
function wu1Min() { return Number(PropertiesService.getScriptProperties().getProperty('wu1Min')); }
function wu1MaxWind() { return Number(PropertiesService.getScriptProperties().getProperty('wu1MaxWind')); }
function wu2Max() { return Number(PropertiesService.getScriptProperties().getProperty('wu2Max')); }
function wu2Cond() { return PropertiesService.getScriptProperties().getProperty('wu2Cond'); }
function wu2Min() { return Number(PropertiesService.getScriptProperties().getProperty('wu2Min')); }
function wu2MaxWind() { return Number(PropertiesService.getScriptProperties().getProperty('wu2MaxWind')); }

/**
 *  Energy Meter
 */
function eInst() { return Number(PropertiesService.getScriptProperties().getProperty('eInst')); }
function eTime() { return Date(Number(PropertiesService.getScriptProperties().getProperty('eTime'))); }
function ePrice() { return Number(PropertiesService.getScriptProperties().getProperty('ePrice')); }
function eCumm() { return Number(PropertiesService.getScriptProperties().getProperty('ePrice')); }

/**
 *  Followmee Functions
 */
function fm0Name() { return PropertiesService.getScriptProperties().getProperty('fm0Name'); }
function fm0Dfh() { return Number(Number(PropertiesService.getScriptProperties().getProperty('fm0Dfh'))); }
function fm0Time() { return Number(PropertiesService.getScriptProperties().getProperty('fm0Time')); }
function fm0Ldfh() { return Number(Number(PropertiesService.getScriptProperties().getProperty('fm0Ldfh'))); }
function fm0Ltime() { return Number(PropertiesService.getScriptProperties().getProperty('fm0Ltime')); }
function fm0Gh() { return PropertiesService.getScriptProperties().getProperty('fm0Gh'); }

/**
 *  Wemo Functions
 */
function we0(state) { return Number(PropertiesService.getScriptProperties().getProperty('we0')); }
function we1(state) { return Number(PropertiesService.getScriptProperties().getProperty('we1')); }
function we2(state) { return Number(PropertiesService.getScriptProperties().getProperty('we2')); }
function we3(state) { return Number(PropertiesService.getScriptProperties().getProperty('we3')); }

/**
 *  Tesla Get Functions
 */
function teslaInsideTemp() { return Number(PropertiesService.getScriptProperties().getProperty('teslaInsideTemp')); }
function teslaOutsideTemp() { return Number(PropertiesService.getScriptProperties().getProperty('teslaOutsideTemp')); }
function teslaBattery() { return Number(PropertiesService.getScriptProperties().getProperty('teslaBattery')); }
function teslaBatteryLowTime() { return Number(PropertiesService.getScriptProperties().getProperty('teslaBatteryLowTime')); }
function teslaUsable() { return Number(PropertiesService.getScriptProperties().getProperty('teslaUsable')); }
function teslaPhase() { return Number(PropertiesService.getScriptProperties().getProperty('teslaPhase')); }
function teslaMaxRangeCount() { return Number(PropertiesService.getScriptProperties().getProperty('teslaMaxRangeCount')); }
function teslaDfh() { return Number(PropertiesService.getScriptProperties().getProperty('teslaDfh')); }
function teslaLon() { return Number(PropertiesService.getScriptProperties().getProperty('teslaLon')); }
function teslaLat() { return Number(PropertiesService.getScriptProperties().getProperty('teslaLat')); }

/**
 *  Myq Garage Door Get Functions
 */
function gDoor() { return PropertiesService.getScriptProperties().getProperty('gDoor'); }
function goDur() { return PropertiesService.getScriptProperties().getProperty('goDur'); }
