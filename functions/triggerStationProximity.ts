/*
 * triggerStationProximity.ts
 * 
 * DEPRECATED, this logic has been incorporated into BloomBus-Tracker
 * 
 * Function executed on every update on 'shuttles' ref. Checks each to see if it is within a certain
 * distance of a stop on its loop, and if so stores that stop's key in the properties of the shuttle.
 *
 */

import * as admin from 'firebase-admin';
import * as turf from '@turf/turf';

export default async function triggerStationProximity(shuttlesRef: admin.database.Reference) {
    const snapshot = await shuttlesRef.once('value');
    // create a map with all children that need to be removed
    const updates = {};

    const loops = (await admin.database().ref('/loops').once('value')).toJSON() as any;
    const stops = (await admin.database().ref('/stops').once('value')).toJSON() as any;

    snapshot.forEach(shuttleSnap => {
      const shuttle = shuttleSnap.val();
      const shuttlePoint = turf.point(shuttle.geometry.coordinates);
      const shuttleLoop = loops.features.find(loop => loop.properties.key === shuttle.properties.loopKey);
      if (shuttleLoop) {
        // Have to do some weird tactics for navigating through the JSON, since Firebase Cloud Functions
        // uses Node 6 and doesn't have methods like Object.values or Object.entries

        // Search through all of the stops for this loop to see if the shuttle is less than 15 meters away
        Object.keys(shuttleLoop.properties.stops).forEach((stopKey, stopIndex) => { // Iterate over each loop object, destructuring its 'features' array
          const stop = stops[stopKey];
          const stationPoint = turf.point([stop.geometry.coordinates[0], stop.geometry.coordinates[1]]);
          if (turf.distance(shuttlePoint, stationPoint, 'kilometers' ) <= 0.015) {
            // shuttleSnap.key: the UUID
            // Setting the object entry to null will delete it in Firebase
            shuttle.properties.prevStation = stop;
            shuttle.properties.nextStation = shuttleLoop.properties.stops[stopIndex + 1];
            updates[shuttleSnap.key] = shuttle;
          }
        });
      }
      return true;
    });
    // execute all updates in one go and return the result to end the function
    return shuttlesRef.update(updates);
  };