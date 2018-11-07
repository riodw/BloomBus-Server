import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as turf from '@turf/turf';

export const triggerStationProximity = functions.database
  .ref("/shuttles")
  .onWrite(async change => {
    const ref = change.after.ref;
    const snapshot = await ref.once('value');
    // create a map with all children that need to be removed
    const updates = {};

    const stationsSnapshotJSON = (await admin.database().ref('/bus-stations').once('value')).toJSON();

    snapshot.forEach(shuttleSnap => {
      const shuttle = shuttleSnap.val();
      const shuttlePoint = turf.point(shuttle.geometry.coordinates);
      // Have to do some weird tactics for navigating through the JSON, since Firebase Cloud Functions
      // uses Node 6 and doesn't have methods like Object.values or Object.entries
      Object.keys(stationsSnapshotJSON).forEach((loopKey) => { // Iterate over each loop object, destructuring its 'features' array
        const { features } = stationsSnapshotJSON[loopKey];
        Object.keys(features).map(key => features[key]).forEach((stationGeoJSON: any) => {
          const stationPoint = turf.point([stationGeoJSON.geometry.coordinates[0], stationGeoJSON.geometry.coordinates[1]]);
          if (turf.distance(shuttlePoint, stationPoint, { units: 'kilometers' }) <= 0.015) {
            // shuttleSnap.key: the UUID
            // Setting the object entry to null will delete it in Firebase
            shuttle.properties.prevStation = loopKey;
            updates[shuttleSnap.key] = shuttle;
          }
        });
      });
      return true;
    });
    // execute all updates in one go and return the result to end the function
    return ref.update(updates);
  });

export default triggerStationProximity;