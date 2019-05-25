// Import requirements
import * as express from 'express';
import * as fs from 'fs';
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
  const loopsRef = db.ref('loops');
  const stopsRef = db.ref('stops');

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

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  app.get('/api/downloadStopsGeoJSON', (req, res) => {
    console.log('GET: /api/downloadStopsGeoJSON');
    stopsRef.once('value', (stopsSnapshot) => {
      const date = new Date();
      const filename = `stops-${date.toISOString().substr(0, 10)}.geojson`;
      const downloadPath = path.join(__dirname, 'downloads', filename);
      fs.writeFileSync(downloadPath, JSON.stringify(stopsSnapshot.val()));
      res.sendFile(downloadPath);
    });
  });

  app.get('/api/downloadLoopsGeoJSON', (req, res) => {
    console.log('GET: /api/downloadLoopsGeoJSON')
    loopsRef.once('value', (stopsSnapshot) => {
      const date = new Date();
      const filename = `loops-${date.toISOString().substr(0, 10)}.geojson`;
      const downloadPath = path.join(__dirname, 'downloads', filename);
      fs.writeFileSync(downloadPath, JSON.stringify(stopsSnapshot.val()));
      res.sendFile(downloadPath);
    });
  });

  app.listen(process.env.PORT || 8080);
}

start();