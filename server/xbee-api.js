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
         ports.forEach(function(port) {
            if(port.manufacturer == 'Silicon_Labs') {
               xbeeNew(port.comName);
            }
         });
      });
   }
   
   function xbeeNew(comName) {  
      //https://www.npmjs.com/package/serialport
      var serialport = new SerialPort(comName, {
         baudRate: 9600,
         parser: xbeeAPI.rawParser(),
         autoOpen: true
      });
      
      var count = 0;
      
      serialport.on("open", function(err) {
         if (err) {
            return console.log(err.message);
         }
         
         var frame_obj = { // AT Request to be sent to
            type: C.FRAME_TYPE.AT_COMMAND,
            command: "NI",
            commandParameter: [],
         };
         
         serialport.write(xbeeAPI.buildFrame(frame_obj));
      });
      
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




// 127
// How are you?
// 128
// How are you?
// 129
// Bus Tracker #1
// Time: 10:10:10.800
// Date: 10/10/2010
// Fix: 0 quality: 0

// 130
// How are you?
// events.js:141
//       throw er; // Unhandled 'error' event
//       ^

// Error: Checksum Mismatch {"buffer":{"type":"Buffer","data":[126,0,24,144,0,19,162,0,65,71,142,107,88,25,1,72,111,119,32,97,114,101,32,121,111,117,63,133,1,0,0,0,0,0,0,0,0,0,0,0,48,104,15,1,0,0,0,0,255,255,255,255,99,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,0,0,4,3,255,255,255,255,96,213,253,3,0,0,0,0,255,255,255,255,0,0,0,0,240,107,15,1,0,0,0,0,187,9,0,0,95,0,0,0,1,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0]},"offset":28,"length":24,"total":1914,"checksum":0,"b":0,"escape_next":false,"waiting":true}
//     at XBeeAPI.parseRaw (/home/bloombus/production/node_modules/xbee-api/lib/xbee-api.js:195:19)
//     at XBeeAPI.<anonymous> (/home/bloombus/production/node_modules/xbee-api/lib/xbee-api.js:133:10)
//     at SerialPort._emitData (/home/bloombus/production/node_modules/serialport/lib/serialport.js:313:18)
//     at SerialPort.<anonymous> (/home/bloombus/production/node_modules/serialport/lib/serialport.js:293:14)
//     at SerialPort.<anonymous> (/home/bloombus/production/node_modules/serialport/lib/serialport.js:306:7)
//     at FSReqWrap.wrapper [as oncomplete] (fs.js:576:17)
// bloombus@bloom-bus:~/production$ Error: Checksum Mismatch^C
