module.exports = function(SerialPort, xbee_api, firebase, pro) {
   var util = require('util');

   //https://www.npmjs.com/package/xbee-api
   var C = xbee_api.constants;

   var xbeeAPI = new xbee_api.XBeeAPI({
      // default options:
      api_mode: 1, // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
      module: "Any", // ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!
      raw_frames: false // [true, false]; If set to true, only raw byte frames are
         // emitted (after validation) but not parsed to objects.
   });


   if(pro == true) {
      SerialPort.list(function(err, ports) {
         if(err) throw err;

         ports.forEach(function(port) {
            if(port.manufacturer == 'Silicon_Labs') {
               // found device, call xbeeNew() to make new connection
               xbeeNew(port.comName);
            }
         });
      });
   }

   // After identifying a "port.manufacturer == 'Silicon_Labs'" Connect to that port
   function xbeeNew(comName) {
      //https://www.npmjs.com/package/serialport
      var serialport = new SerialPort(comName, {
         baudRate: 9600,
         parser: xbeeAPI.rawParser(),
         autoOpen: true
      });
      
      var count = 0;
      
      console.log('\n------- Connecting to FireBase -------\n');
      
      firebase.initializeApp({
         serviceAccount: "server/BloomBus-0096d2641a16.json",
         databaseURL: "https://bloombus-68ea7.firebaseio.com",
         databaseAuthVariableOverride: {
            uid: "my-service-worker"
         }
      });
      
      // Creating Database Reference
      var db = firebase.database();
      var bus_dataRef = db.ref("/bus_data");
      // ref.once("value", function(snapshot) {
      //    console.log(snapshot.val());
      // });
      
      console.log('\n------- Connected -------\n');
      
      // Day key logic
      var dateKey;
      var timeKey;
      function getNewTime() {
         var date = new Date().toISOString();
         date = date.split('T');
         dateKey = date[0];
         timeKey = date[1];
         timeKey = timeKey.split('.');
         timeKey = timeKey[0];
         
         return [dateKey, timeKey];
      }
      
      
      var xbee_data = '';
      var xbee_data_obj = {};
      var date_now = [];
      // All frames parsed by the XBee will be emitted here
      xbeeAPI.on("frame_object", function(frame) {
         console.log(count++);
         
         // Turn xbee_data into readable output, not HEX
         xbee_data = String(frame.data);
         
         // Get updated time
         date_now = getNewTime();
         
         // Set up Data in JSON format
         xbee_data_obj[date_now[1]] = xbee_data;
         console.log(xbee_data);
         
         // Push Data to Firebase
         bus_dataRef.child(date_now[0]).push(xbee_data_obj);
         
         // Clear xbee_data_obj
         xbee_data_obj = {};
      });
   }
   
   
   
   
   
   /*port.on('data', function (data) {
      var buff = new Buffer(data, 'utf8');
      console.log('Data: ' + buff.toString('hex'));
   });*/

};