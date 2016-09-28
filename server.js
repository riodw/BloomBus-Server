var express = require('express');
var http = require('http');
// Native NodeJS module for resolving paths
var path = require('path');

var port = process.env.PORT;

var server_IP = process.env.IP;

// IMPORTANT! - For Running on Production Server
// Needs Command Line Argument of "real" <node server.js real>
process.argv.forEach(function (val, index, array) {
   if(val == 'real') {
      port = 8080;
      server_IP = "148.137.138.107";
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
 * MONGODB
 *************************************************************/
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var configDB = require('./server/database.js')(server_IP);
mongoose.connect(configDB.url);


/*************************************************************
 * Define app
 *************************************************************/
var app = express();

/*************************************************************
 * Main
 *************************************************************/
// Set up
app.set('view engine', 'ejs');
app.use(express.static(path.resolve(__dirname, 'client')));
app.set('views', path.resolve(__dirname, 'client', 'views'));

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
 * Routes
 *************************************************************/
require('./server/routes.js')(app);


//- Final Redirect Catch All
//-------------------------------------------------

app.get('/*', function(req, res) {
   res.redirect('/');
   // console.log('/* ' + req.body);
});


/************************************************************
 * Start Server
 ************************************************************/
http.createServer(app).listen(port, function() {
   console.log('SERVER RUNNING... PORT: ' + port);
});