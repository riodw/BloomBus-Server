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


    if (pro == true) {
        SerialPort.list(function(err, ports) {
            if (err) throw err;

            ports.forEach(function(port) {
                if (port.manufacturer == 'Silicon_Labs') {
                    xbeeNew(port.comName); // found device, call xbeeNew() to make new connection
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

        // Initialize Firebase
        firebase.initializeApp({
            apiKey: "AIzaSyCfWbVagQG3V60EEF2JtJDTHZIt6C8sDeQ",
            authDomain: "bloombus-163620.firebaseapp.com",
            databaseURL: "https://bloombus-163620.firebaseio.com",
            projectId: "bloombus-163620",
            storageBucket: "bloombus-163620.appspot.com",
            messagingSenderId: "740651108770"
        });

        // Creating Database Reference
        var db = firebase.database();
        var bus_dataRef = db.ref(); // creates a database reference at the root node
        // ref.once("value", function(snapshot) {
        //    console.log(snapshot.val());
        // });

        console.log('\n------- Connected -------\n');

        // Day key logic
        var dateKey;
        var timeKey;
        // Keep track of hour to empty active_busses array
        var hour;

        function getNewTime() {
            var date = new Date().toISOString(); // date == 2016-10-31T14:48:00.000Z
            date = date.split('T'); // date == ["2016-10-31", "14:48:00.000Z"]
            dateKey = date[0]; // dateKey == "2016-10-31"
            timeKey = date[1]; // timeKey == "14:48:00.000Z"
            timeKey = timeKey.split('.'); // timeKey == ["14:48:00", "000Z"]
            timeKey = timeKey[0]; // timeKey == "14:48:00"
            hour = timeKey.split(':');
            hour = hour[0];

            return [dateKey, timeKey];
        }

        //Array to store bus count;
        var active_busses = [];
        var lastHour = 0;

        function updateBuscount(iden) {
            if (lastHour != hour) {
                lastHour = hour;
                active_busses = [];
            }
            if (active_busses.indexOf(iden) == -1) {
                active_busses.push(iden);
                // Update Buss Count
                bus_dataRef.child('active_busses').set(active_busses);
            }
        }


        var xbee_data = '';
        var date_now = [];

        // All frames parsed by the XBee will be emitted here
        xbeeAPI.on("frame_object", function(frame) {
            console.log(count++);

            // Turn xbee_data into readable output, not HEX
            xbee_data = String(frame.data);

            // Get updated time
            date_now = getNewTime();

            console.log(xbee_data);

            xbee_data = xbee_data.split(','); // ["IDEN(1)", "TIME(20:55:40)", "DATE(10/31/16)", ...]
            var iden;
            if (xbee_data[3].charAt(5) == '0')
                return; // FIXQ has values of 0%0 (invalid), do not log data to the database
            iden = xbee_data[0]; // "IDEN(1)"
            iden = iden.substring(iden.indexOf('(') + 1, iden.indexOf(')')); // '1'
            //  if(iden != '' && iden != undefined)
            updateBuscount(iden);

            // Push Data to Firebase
            bus_dataRef.child(date_now[0]).child("tracker-" + iden).child(date_now[1]).set(xbee_data);
        });
    }



    /*
    port.on('data', function (data) {
       var buff = new Buffer(data, 'utf8');
       console.log('Data: ' + buff.toString('hex'));
    });*/

};
