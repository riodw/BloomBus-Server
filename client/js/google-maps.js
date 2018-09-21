/* global firebase, google, document, moment */

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCfWbVagQG3V60EEF2JtJDTHZIt6C8sDeQ',
  authDomain: 'bloombus-163620.firebaseapp.com',
  databaseURL: 'https://bloombus-163620.firebaseio.com',
  projectId: 'bloombus-163620',
  storageBucket: 'bloombus-163620.appspot.com',
  messagingSenderId: '740651108770',
};
firebase.initializeApp(config);

/*-------------------------------
MAGIC CODE THAT MAKES IT ALL WORK
--------------------------------*/
let map;
const shuttles = new Map(); // JavaScript Map, not Google Map

function attachMoveListener(shuttleSnapshot) {
  const shuttleData = shuttleSnapshot.val();
  const shuttleTimestamp = moment(shuttleData.properties.timestamp);
  const now = moment();
  if (shuttleTimestamp.isAfter(now.subtract(30, 'seconds'))) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng({
        lat: shuttleData.geometry.coordinates[0],
        lng: shuttleData.geometry.coordinates[1],
      }),
      icon: {
        path: 'M512 1216q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm1024 0q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm-46-396l-72-384q-5-23-22.5-37.5t-40.5-14.5h-918q-23 0-40.5 14.5t-22.5 37.5l-72 384q-5 30 14 53t49 23h1062q30 0 49-23t14-53zm-226-612q0-20-14-34t-34-14h-640q-20 0-34 14t-14 34 14 34 34 14h640q20 0 34-14t14-34zm400 725v603h-128v128q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5v-128h-768v128q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5v-128h-128v-603q0-112 25-223l103-454q9-78 97.5-137t230-89 312.5-30 312.5 30 230 89 97.5 137l105 454q23 102 23 223z',
        fillOpacity: 0.8,
        scale: 0.015,
      },
      title: shuttleData.properties.name,
      label: {
        color: '#333',
        fontWeight: 'bold',
        text: shuttleData.properties.name,
      },
      map,
    });
    shuttles.set(shuttleSnapshot.ref.key, {
      marker,
      ref: shuttleSnapshot.ref,
    });
    console.log(shuttles.get(shuttleSnapshot.key));
    shuttleSnapshot.ref.on('value', (newShuttleSnapshot) => {
      const newShuttleData = newShuttleSnapshot.val();
      (shuttles.get(shuttleSnapshot.ref.key)).marker.setPosition(new google.maps.LatLng({
        lat: newShuttleData.geometry.coordinates[0],
        lng: newShuttleData.geometry.coordinates[1],
      }));
    });
  }
}

/*
 * Google Maps
 */
function initMap() { // Called via callback passed in link to Google Maps API
  const mapStyles = [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [
        { visibility: 'off' },
      ],
    },
  ];
  const mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng('41.011', '-76.449'),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: mapStyles,
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  const shuttlesRef = firebase.database().ref('shuttles');
  shuttlesRef.once('value', (shuttlesSnapshot) => {
    shuttlesSnapshot.forEach((shuttleSnapshot) => { attachMoveListener(shuttleSnapshot); });
  });
}
