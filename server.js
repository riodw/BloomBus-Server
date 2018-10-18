const express = require('express');
const http = require('http');

// Native NodeJS module for resolving paths
const path = require('path');

const port = 80;

const bodyParser = require('body-parser');

/*
 * Define Express app
 */
const app = express();

/*
 * Main
 */
app.use(express.static(path.resolve(`${__dirname}/client/public`)));
app.use(bodyParser.json());

/*
 * BLOOMBUS APP - MODULE CODE
 */
// const firebase = require('firebase');
// const SerialPort = require('serialport');
// const xbeeApi = require('xbee-api');
// require('./server/xbee-api.js')(SerialPort, xbeeApi, firebase);


/** ***********************************************************
 * Routes                                                    *
 ************************************************************ */
require('./server/routes.js')(app, path);

// - Final Redirect Catch All
//-----------------------------------
app.get('/*', (req, res) => {
  res.redirect('/');
  // console.log('/* ' + req.body);
});


/** **********************************************************
 * Start Server                                             *
 *********************************************************** */
http.createServer(app).listen(process.env.PORT || port, () => {
  console.log(`SERVER RUNNING... PORT: ${port}`);
});

