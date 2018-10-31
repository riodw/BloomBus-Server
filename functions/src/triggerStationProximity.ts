import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as turf from '@turf/turf';

export const reapOldShuttles = functions.database
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
      Object.values(stationsSnapshotJSON).forEach((loopObj) => {
        Object.values(loopObj).forEach((stationGeoJSON: any) => {
          const stationPoint = turf.point(stationGeoJSON.geometry.coordinates);
          if (turf.distance(shuttlePoint, stationPoint, 'kilometers') < 15) {
            // shuttleSnap.key: the UUID
            // Setting the object entry to null will delete it in Firebase
            updates[shuttleSnap.key] = {
              properties: {
                prevStation: stationGeoJSON.properties.name,
                ...shuttle.properties
              },
              ...shuttle
            };
          }
        });
      });
      return true;
    });
    // execute all updates in one go and return the result to end the function
    return ref.update(updates);
  });

export default reapOldShuttles;