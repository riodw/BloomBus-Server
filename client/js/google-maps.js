/* global firebase, google, document */

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

// Day key logic
let dateKey;
// var timeKey;
function getNewTime() {
  let date = new Date().toISOString();
  date = date.split('T');
  dateKey = date[0];
  // timeKey = date[1];
  // timeKey = timeKey.split('.');
  // timeKey = timeKey[0];
  return String(dateKey);
}
console.log(getNewTime());

const database = firebase.database().ref(`bus_data/${getNewTime()}`);

const colors = ['red', 'blue', 'green', 'yellow', 'cyan', 'magenta']; // For Map markers

/*-------------------------------
MAGIC CODE THAT MAKES IT ALL WORK
--------------------------------*/
let map;
const markers = [];

const numDeltas = 100;
const delay = 10; // milliseconds
let i = 0;
let position;
let deltaLat;
let deltaLng;

function moveMarker(iden) {
  position[0] += deltaLat;
  position[1] += deltaLng;
  const latlng = new google.maps.LatLng(position[0], position[1]);
  markers[iden - 1].setPosition(latlng);
  if (i != numDeltas) {
    i++;
    setTimeout(moveMarker(iden), delay);
  }
}

function transition(iden, result) {
  i = 0;
  position = [markers[iden - 1].getPosition.lat(), markers[iden - 1].getPosition.lng()];
  deltaLat = (result[0] - position[0]) / numDeltas;
  deltaLng = (result[1] - position[1]) / numDeltas;
  moveMarker(iden);
}

// GOOGLE MAPS
function initMap() {
  // Starting Position
  const latlng = new google.maps.LatLng('41.008528', '-76.446415');
  // Google Maps Options
  const myOptions = {
    zoom: 17,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };

  map = new google.maps.Map(document.getElementById('map'), myOptions);

  const busSymbol = {
    path: 'M512 1216q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm1024 0q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm-46-396l-72-384q-5-23-22.5-37.5t-40.5-14.5h-918q-23 0-40.5 14.5t-22.5 37.5l-72 384q-5 30 14 53t49 23h1062q30 0 49-23t14-53zm-226-612q0-20-14-34t-34-14h-640q-20 0-34 14t-14 34 14 34 34 14h640q20 0 34-14t14-34zm400 725v603h-128v128q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5v-128h-768v128q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5v-128h-128v-603q0-112 25-223l103-454q9-78 97.5-137t230-89 312.5-30 312.5 30 230 89 97.5 137l105 454q23 102 23 223z',
    fillOpacity: 0.8,
    scale: 0.015,
  };

  /* Initializes a map marker to the center of campus
   marker = new google.maps.Marker({
      position: latlng,
      icon: busSymbol,
      map: map,
      title: "Your current location!"
   });
   */

  // Stuff for Firebase Loop
  const buspath = [];
  let newpath;
  // Document Element Valiables
  const ul = document.getElementById('list');
  const live = document.getElementById('live');
  // all records after the last continue to invoke this function
  database.limitToLast(1).on('child_added', (snapshot) => {
    // Update Live Feed
    if (live.style.display == 'block') {
      let li = document.createElement('li');
      li.innerHTML = snapshot.val();
      ul.appendChild(li);
    }

    if (snapshot.val().includes('LALO')) {
      newpath = snapshot.val().split('LALO');
      newpath = newpath[1].split(',');
      if (newpath[0].includes('(')) {
        newpath = newpath[0].substring(1, newpath[0].length - 1);
        if (newpath.includes('%')) {
          newpath = newpath.split('%');
          newpath[1] = '-' + newpath[1];

          let iden = snapshot.val().split(',');
          iden = iden[0].substring(5, iden[0].length() - 1);
          if (markers[iden - 1] == false) {
            markers[iden - 1] = new google.maps.Marker({
              position: new google.maps.LatLng(newpath[0], newpath[1]),
              icon: {
                path: busSymbol.path,
                fillOpacity: busSymbol.fillOpacity,
                color: colors[(iden - 1) % colors.length],
                scale: 0.015,
              },
              map,
              title: 'Bus #' + iden,
            });
          }

          console.log(newpath);
          buspath.push(newpath);

          // Update position
          transition(iden, newpath);
        }
      }
    }
  });
}