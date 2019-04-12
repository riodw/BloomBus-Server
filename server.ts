// Import requirements
import * as admin from 'firebase-admin';
import { default as serviceAccount } from './serviceAccountKey';

// Import types
import { ShuttleRun, ShuttleRunPoint } from './interfaces/ShuttleRun';

// Import functions
import simulateRuns from './functions/simulateRuns';
import reapOldShuttles from './functions/reapOldShuttles';
import triggerStationProximity from './functions/triggerStationProximity';

// Import raw data
import * as campusRunPoints from './raw_data/campus_run1.gpx.json';

function start() {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as Object),
    databaseURL: 'https://bloombus-163620.firebaseio.com'
  });

  const db = admin.database();
  const shuttlesRef = db.ref('shuttles');
  shuttlesRef.onDisconnect().remove();

  const campusRun = {
    name: 'Campus Loop',
    key: 'campus',
    points: campusRunPoints,
  }
  const runs: Array<ShuttleRun> = [ campusRun ];
  simulateRuns(runs, shuttlesRef);

  shuttlesRef.on('value', () => {
    reapOldShuttles(shuttlesRef);
    triggerStationProximity(shuttlesRef);
  });  
}

start();