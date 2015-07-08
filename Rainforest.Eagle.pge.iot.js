/*
      Service:  Rainforest.com (makes the Rainforest Eagle Zigbee smart meter power monitor)
      Device:  Rainforest Eagle Zigbee smart meter power monitor     
      Service:  PGE for historical data, rate data  NOT used at this time

     The rainforest eagle can respond to API locally or through a proxy service in the cloud which effectively acts as a smart DNS
     The rainforest eagle can get instantaneous demand for electricity as well as cumulative demand.  You can ask for current pricing for power and 
       characteristics of the pricing zone.  You can also ask historical questions of the service which keeps some data on the Eagle and some in the services
       The eagle can talk to a number of vendors who can take the data and help you analyze your data usage.  I also hook the Eagle to Biggely which so far
      has not provided very good analytics
       The Eagle seems fairly robust and there are many modes it has for supporting how fast it polls the meter
           
     getEnergyStatsData() polls the Eagle and gets the latest information
        sets Google properties to use in spreadsheets and also sends information to Devicehub.net and ATT M2X
     sendEnergyToHub(time, demand, price)   sends data to devicehub.net
      setEnergyDataATT()   sends data to ATT M2X
    eInst()  these functions are available in spreadsheets to use for calculations or presentations
    eTime() 
    ePrice() 
 */

/****************************************************************************************************************
 *     Rainforest Eagle Energy Meter Data
 */
function getEnergyStatsData() {
 
  var url = getSecureVal("Rainforest", "URL");
  var macId = getSecureVal("Rainforest", "MAC");
  var getDemand = "\n\r<Command>\n\r<Name>get_instantaneous_demand</Name>\n\r<MacId>" + macId + 
                 "</MacId>\n\r<Format>JSON</Format>\n\r</Command>\n\r";
  var getPrice = "\n\r<Command>\n\r<Name>get_price</Name>\n\r<MacId>" + macId + 
                 "</MacId>\n\r<Format>JSON</Format>\n\r</Command>\n\r";

  var headers =
   {     
     "Accept": "*/*",
     "Content-Type": "text/xml",
     "User" : getSecureVal("Rainforest", "EMAIL"),
     "Cloud-Id" : getSecureVal("Rainforest", "USERNAME"),
     "Password" : getSecureVal("Rainforest", "PASSWORD"),
     "Connection" : "keep-alive",
     "Pragma" : "no-cache",
     "Cache-Control" : "no-cache"
   };
   
   var options_demand =
   {
     "method" : "post",
     "headers" : headers,
     "payload" : getDemand
   };

  var options_price =
   {
     "method" : "post",
     "headers" : headers,
     "payload" : getPrice
   };

   /* fetch inst demand */
   var props = PropertiesService.getScriptProperties();
   var json = UrlFetchApp.fetch(url, options_demand).getContentText();
   var energyData = JSON.parse(json);
   energyData = energyData.InstantaneousDemand;
   Logger.log(energyData);
   Jan12000 = 946684800; /* Jan 1, 2000 */
  
   var time = parseInt(energyData.TimeStamp, 16) + Jan12000;

   var demand =  parseInt(energyData.Demand, 16) * parseInt(energyData.Multiplier, 16) / parseInt(energyData.Divisor, 16);
  
   /* get price */
   json = UrlFetchApp.fetch(url, options_price).getContentText();
   energyData = JSON.parse(json);
   energyData = energyData.PriceCluster;

   var price = parseInt(energyData.Price, 16) / 1000;
   props.setProperty( "eInst", demand);
   props.setProperty( "eTime", time); 
   props.setProperty( "ePrice", price);
  
  /* send to ATT M2X*/
  var streams =  [ "ePrice", "eInst", "eCumm" ];
  sendDataATT("Rainforest", streams);
  logProps(streams);
  sendEnergyToHub(time, demand, price);
  return demand;
}