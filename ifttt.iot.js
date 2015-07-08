/*
 *       Service:   IFTTT 

	IFTTT provides support for SMS
           integration with Google Mail
           integration with 
 */

/****************************************************************************************************************
 *     IFTTT Send trigger to IFTTT
 */
function sendIFTTT(event) {
  var url = getSecureVal("IFTTT", "URL");
  var apiKey = getSecureVal("IFTTT", "APIKEY");
  var response = UrlFetchApp.fetch(url + event + "/with/key/" + apiKey).getContentText();
  Logger.log("Send "+event+" to IFTTT");
  Logger.log(response);
}

