// Import requirements
import * as express from 'express';
import * as path from 'path';
import * as admin from 'firebase-admin';
import { default as serviceAccount } from './serviceAccountKey';

// Import types
import ShuttleRun  from './interfaces/ShuttleRun';
import IConstants from './interfaces/IConstants';

// Import functions
import simulateRuns from './functions/simulateRuns';
import reapOldShuttles from './functions/reapOldShuttles';
import triggerStationProximity from './functions/triggerStationProximity';

// Import raw data
import * as campusRunPoints from './raw_data/campus_run1.gpx.json';

async function start() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as Object),
    databaseURL: 'https://bloombus-163620.firebaseio.com'
  });

  const db = admin.database();
  const shuttlesRef = db.ref('shuttles');
  const constantsRef = db.ref('constants');

  await constantsRef.once('value', (dataSnapshot: admin.database.DataSnapshot) => {
    const   { reapShuttleThresholdMilliseconds, stopProximityThresholdMeters } = dataSnapshot.val() as IConstants;
    const campusRun = {
      name: 'Campus Loop',
      key: 'campus',
      points: campusRunPoints,
    }
    const runs: Array<ShuttleRun> = [ campusRun ];
    simulateRuns(runs, shuttlesRef);
  
    shuttlesRef.on('value', () => {
      reapOldShuttles(shuttlesRef, reapShuttleThresholdMilliseconds);
      // DEPRECATED triggerStationProximity(shuttlesRef);
    });
  });

  const app = express();
  app.use(express.static(path.join(__dirname, 'client', 'build')));

  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  app.listen(process.env.PORT || 8080);
}

start();