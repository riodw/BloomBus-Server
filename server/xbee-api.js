module.exports = function(SerialPort, xbee_api, pro) {
   var util = require('util');
   
   //https://www.npmjs.com/package/xbee-api
   var C = xbee_api.constants;
   
   var xbeeAPI = new xbee_api.XBeeAPI({
      // default options:
      api_mode: 1,      // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
      module: "Any",    // ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!
      raw_frames: false // [true, false]; If set to true, only raw byte frames are
                        // emitted (after validation) but not parsed to objects.
   });
   
   
   if(pro == true) {
      SerialPort.list(function (err, ports) {
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
      
      // All frames parsed by the XBee will be emitted here
      xbeeAPI.on("frame_object", function(frame) {
         console.log(count++);
         var buffer = String(frame.data);
         console.log(buffer);
      });
   }
   
   console.log('\n---------- HERE ------------\n');
   
   /*port.on('data', function (data) {
      var buff = new Buffer(data, 'utf8');
      console.log('Data: ' + buff.toString('hex'));
   });*/
   
};