import * as functions from 'firebase-functions';

// Timeout threshold. Shuttle nodes older than this will be deleted.
const TIMEOUT = 15 * 1000; // 15 seconds in milliseconds.

export const reapOldShuttles = functions.database
  .ref("/shuttles")
  .onWrite(async change => {
    const ref = change.after.ref; // reference to the parent ("/shuttles")
    const now = Date.now();
    const cutoff = now - TIMEOUT;
    const oldItemsQuery = ref.orderByChild("properties/timestamp").endAt(cutoff);
    const snapshot = await oldItemsQuery.once("value");
    // create a map with all children that need to be removed
    const updates = {};
    snapshot.forEach(child => {
      updates[child.key] = null;
      return true;
    });
    // execute all updates in one go and return the result to end the function
    return ref.update(updates);
  });

export default reapOldShuttles;
