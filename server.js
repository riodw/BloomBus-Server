var express = require('express');
var http = require('http');

// Native NodeJS module for resolving paths
var path = require('path');

// Used to get IP Address
var os = require('os');

var port = process.env.PORT;
var server_IP = process.env.IP;

// IMPORTANT! - For Running on Production Server
var pro = false;
// Needs Command Line Argument of "real" <node server.js real>
process.argv.forEach(function (val, index, array) {
   if (val == 'real') {
      port = 8080;
      pro = true;
      
      // Set IP Address
      var ifaces = os.networkInterfaces();
      Object.keys(ifaces).forEach(function(ifname) {
         var alias = 0;
         
         ifaces[ifname].forEach(function(iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
               // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
               return;
            }
            
            if (alias >= 1) {
               // this single interface has multiple ipv4 addresses
               console.log(ifname + ':' + alias, iface.address);
               throw "Error: "
                  + "There are multiple IPV4 addresses. You must hard code the the IP address.";
            }
            else {
               // this interface has only one ipv4 adress
               console.log(ifname, iface.address);
               // Setting IP
               server_IP = iface.address;
            }
            ++alias;
         });
      });
      // FOR USE WHEN IP MUST BE HARD CODED
      // server_IP = "148.137.138.107";
   }
});


// Async
// var async = require('async');
// Middle ware
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// var methodOverride = require('method-override');
// var passport = require('passport');
var session = require('express-session');
// FILE SYSTEM
const fs = require('fs');
// For File Upload
// var multer = require('multer');



/*************************************************************
 * MONGODB                                                   *
 *************************************************************/
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var configDB = require('./server/database.js')(server_IP);
mongoose.connect(configDB.url);


/*************************************************************
 * Define app                                                *
 *************************************************************/
var app = express();

/*************************************************************
 * Main                                                      *
 *************************************************************/
// Set up

app.use(express.static(path.resolve(__dirname + '/client')));

// Adding
// app.use(cookieParser());
app.use(bodyParser.json());
// app.use(methodOverride());
app.use(
   session({
      secret: 'securedsession',
      saveUninitialized: true,
      resave: true,
      store: new MongoStore({
         mongooseConnection: mongoose.connection,
         ttl: 14 * 24 * 60 * 60
      })
   })
);

/*************************************************************
 * BLOOMBUS APP - MODULE CODE                                *
 *************************************************************/
var firebase = require("firebase");
var SerialPort = require("serialport");
var xbee_api = require('xbee-api');
require('./server/xbee-api.js')(SerialPort, xbee_api, firebase, pro);


/*************************************************************
 * Routes                                                    *
 *************************************************************/
require('./server/routes.js')(app, path);

//- Final Redirect Catch All
//-----------------------------------
app.get('/*', function(req, res) {
   res.redirect('/');
   // console.log('/* ' + req.body);
});



/************************************************************
 * Start Server                                             *
 ************************************************************/
http.createServer(app).listen(port, function() {
   console.log('SERVER RUNNING... PORT: ' + port);
});



// -----------------------

