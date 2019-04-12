"use strict";
exports.__esModule = true;
// Import requirements
var admin = require("firebase-admin");
var serviceAccountKey_1 = require("./serviceAccountKey");
// Import functions
var simulateRuns_1 = require("./functions/simulateRuns");
// Import raw data
var campusRunPoints = require("./raw_data/campus_run1.gpx.json");
function start() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey_1["default"]),
        databaseURL: 'https://bloombus-163620.firebaseio.com'
    });
    var db = admin.database();
    var shuttlesRef = db.ref('shuttles');
    shuttlesRef.onDisconnect().remove();
    var campusRun = {
        name: 'Campus Loop',
        key: 'campus',
        points: campusRunPoints
    };
    var runs = [campusRun];
    simulateRuns_1["default"](runs, shuttlesRef);
}
start();
