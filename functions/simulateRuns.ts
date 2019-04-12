import * as admin from 'firebase-admin';
import * as uuidv4 from 'uuid/v4';
import { ShuttleRun, ShuttleRunPoint } from '../interfaces/ShuttleRun';

export default function simulateRuns(runs: Array<ShuttleRun>, dbRef: admin.database.Reference) {
  const uuid = uuidv4();
  const shuttleRef = dbRef.child(uuid); // Create a new child node with this uuid
  shuttleRef.onDisconnect().remove((err) => { if (err) console.error(err); }); // Set reference to self-destruct on disconnect

  runs.forEach((shuttleRun: ShuttleRun) => {
    let i = 0;
    setInterval(() => {
      const shuttlePoint = shuttleRun.points[i];
      console.log(`${i} - ${shuttlePoint.Duration}, ${shuttlePoint["Latitude(WGS84)"]} ${shuttlePoint["Longitude(WGS84)"]}`);
      const geoJSON = {
        type: "Feature",
        geometry: {
          coordinates: [shuttlePoint["Longitude(WGS84)"], shuttlePoint["Latitude(WGS84)"]]
        },
        properties: {
          altitude: shuttlePoint["Altitude(feet)"],
          speed: shuttlePoint["Speed(mph)"],
          loopDisplayName: shuttleRun.name,
          loopKey: shuttleRun.key,
          timestamp: Date.now(),
        }
      };
      shuttleRef.set(geoJSON);

      ++i;
      i = i % shuttleRun.points.length;
    }, 1000);
  });
}