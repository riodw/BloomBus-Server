export * from './reapOldShuttles';
export * from './triggerStationProximity';

import * as admin from "firebase-admin";
import { default as serviceAccount } from "./serviceAccountKey";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as Object),
  databaseURL: 'https://bloombus-163620.firebaseio.com'
});