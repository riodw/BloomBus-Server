/* global firebase, google, document, moment */

const busSimple = 'M512 1216q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm1024 0q0-53-37.5-90.5t-90.5-37.5-90.5 37.5-37.5 90.5 37.5 90.5 90.5 37.5 90.5-37.5 37.5-90.5zm-46-396l-72-384q-5-23-22.5-37.5t-40.5-14.5h-918q-23 0-40.5 14.5t-22.5 37.5l-72 384q-5 30 14 53t49 23h1062q30 0 49-23t14-53zm-226-612q0-20-14-34t-34-14h-640q-20 0-34 14t-14 34 14 34 34 14h640q20 0 34-14t14-34zm400 725v603h-128v128q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5v-128h-768v128q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5v-128h-128v-603q0-112 25-223l103-454q9-78 97.5-137t230-89 312.5-30 312.5 30 230 89 97.5 137l105 454q23 102 23 223z';
const busTop = 'M260 369.8c-3-12-3.8-34-3.8-56.2 0-22.1.8-44.3 3.7-56.2 2.2-9.3 10.7-13.7 23-13.4h363.2c16.4-.2 31.9-.2 39.1 1 16 2.5 27.2 7.1 29.6 14.8 4.7 14 7 33.9 7 53.8s-2.2 39.8-7 53.9c-2.4 7.6-13.6 12.2-29.6 14.7-7.2 1.2-22.7 1.2-39.1 1H282.9c-12.3.3-20.8-4-23-13.4';

const DATA_TIMEOUT = 15; // seconds

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

let now;
let map; // The Google Map
const markers = {}; // JavaScript Map object, not Google Map
const shuttleStopMarkers = [];

function constructMarker(shuttleSnapshot) {
  const shuttleData = shuttleSnapshot.val();
  const marker = new google.maps.Marker({
    position: new google.maps.LatLng({
      lat: shuttleData.geometry.coordinates[0],
      lng: shuttleData.geometry.coordinates[1],
    }),
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1ODMuMiIgaGVpZ2h0PSIyMDYuMSI+PGcgZmlsbD0iIzhkOGY5MyIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNNDYwLjIgMTg3LjVsLTY2LjQtMy41Yy04LjUtLjUtMTMuMy0yLjUtMTMuOC00LjNsLTEuNS01LjRjLS4yLTEuMyAzLjgtMiAxMC0yaDEzYTI0MS4zIDI0MS4zIDAgMCAxIDMzLjQgMS43bDI2LjQgNGM1LjcuOSA5LjkgMi4xIDkuNyAzLjV2NC44YzAgLjgtNiAxLjUtMTAuOCAxLjIiLz48cGF0aCBkPSJNNC41IDMyLjhDLjggNDcuOC0uMiA3NS4zLS4yIDEwM2MwIDI3LjYgMSA1NS40IDQuNiA3MC4zIDIuOCAxMS42IDEzLjQgMTcgMjguOCAxNi43aDQ1NGMyMC41LjMgMzkuOC4zIDQ4LjgtMS4zIDIwLTMgMzQtOC44IDM3LTE4LjQgNi0xNy42IDguOC00Mi40IDguOC02Ny4zUzU3OSA1My4yIDU3MyAzNS42Yy0zLTkuNS0xNy0xNS4yLTM3LTE4LjQtOS0xLjQtMjguMy0xLjQtNDguOC0xLjJoLTQ1NGMtMTUuNC0uNC0yNiA1LTI4LjggMTYuOCIvPjwvZz48cGF0aCBkPSJNNDMwLjUgMTc0bDUgMTEuNi00MS43LTIuMWMtMi45LS4xLTUuOS0uNi04LjgtMS4zLTUtMS4zLTQuNi0yLjYtNi04IDAtMSA3LjUtMS40IDguNC0xLjQgMTQuNCAwIDI4LjgtLjMgNDMuMSAxLjJtOS43IDExLjlsLTQuOC0xMS4zYzExIDEuNyAyMi4zIDIuNSAzMi45IDUuNCAzLjQgMS4xIDIuNCAyLjMgMi4yIDYtLjggMS04LjIgMS05LjMgMWwtMjEtMS4xIiBmaWxsPSIjZDJkMmQxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNNDcxLjIgMTg3YzEuMyAwIDIuNS41IDQuMiAyLjQgMi44IDIuOCAxLjQgNC41LjUgNy44LTEgMy42LS40IDMtMi43IDYuNi0xLjUgMi0zIDIuMy01LjcgMi4zLTEuMiAwLTIuNi0xLjEtMi41LTIuNWwzLjgtMTQuMmMuMi0xLjMgMS4xLTIuNSAyLjUtMi41IiBmaWxsPSIjOGQ4ZjkzIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNNDQwLjcgNTJjMi41IDIxLjYgMy44IDQzLjYgMi44IDY1LjQtLjIgMTIuOC0xLjcgMjYuMi0zIDM5bC0xLjcgMTIuNWMxNS4yIDIgMzAuMSA2LjUgNDUuNCA4IDcgLjUgMTUuMy42IDE5LjMtNi4yIDIuNS00LjQgMy44LTExLjIgNS0xNi4zIDgtMzYuMyA3LjUtNzYuMy0yLjUtMTEyLjItMS4yLTQuNy0yLjctOS03LjMtMTEuMi04LjUtMy44LTIxLjMtMS0zMCAuOGEyODggMjg4IDAgMCAxLTI5LjcgNS40Yy0uMiAxIC4zIDMuMy40IDQuM2wxLjMgMTAuNSIgZmlsbD0iI2QyZDJkMSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTUzOC4zIDE3MGMtMiAxMS4zIDYgMTguMSAxOC4yIDcuNSA0LTMuNSAxMS44LTEzLjEgMTEuNy0zMS05IDIuNS0yOC4zIDE0LjMtMzAgMjMuNiIgZmlsbD0iI2U5ZThlOCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTQ0IDQ2LjNjMC0zLS43LTUuNC0xLjUtNS40aC03Yy0uOCAwLTQgMy40LTQuMiA2LjJhNzc1IDc3NSAwIDAgMC0yLjggNTZjMCAxNi40IDEuMiAzMi45IDIuOCA1NiAwIDIuOSAzLjQgNi4zIDQuMiA2LjNoN2MuOCAwIDEuNC0yLjUgMS40LTUuNC0xLjItMTktMi4yLTM3LjgtMi4yLTU2LjlzLjUtMzcuOCAyLjItNTYuOCIgZmlsbD0iIzhkOGY5MyIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTM1LjcgNDEuM2MtMiAuNi0zLjcgNC0zLjggNS44QzMwLjggNjMgMjkgNzkuNCAyOSA5NS40Yy0uNiAyMS4yIDEuMyA0Mi42IDIuOCA2My43LjQgMS44IDIgNS4yIDMuNyA1LjhoN2MxLjgtMy41LjctMTAgLjQtMTMuOC0xLTE4LjItMi4xLTM2LjgtMS42LTU1LjEgMC0xNi42LjktMzMuMyAyLjItNDkuOGExMiAxMiAwIDAgMC0xLTVoLTYuOE00MzAuNSAzMi4xbDUtMTEuNy00MS43IDIuMmMtMi45LjEtNS45LjUtOC44IDEuMy01IDEuMi00LjYgMi42LTYgOCAwIDEuMSA3LjUgMS41IDguNCAxLjUgMTQuNCAwIDI4LjguMiA0My4xLTEuM205LjctMTJsLTQuOCAxMS4zYzExLTEuNiAyMi4zLTIuNSAzMi45LTUuMyAzLjQtMS4xIDIuNC0yLjIgMi4yLTYtLjgtMS04LjItMS05LjMtMWwtMjEgMSIgZmlsbD0iI2QyZDJkMSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTQ3MS4zIDE5LjNjMS4yIDAgMi41LS43IDQuMS0yLjYgMi45LTIuOCAxLjQtNC40LjUtNy44LTEtMy41LS4yLTMtMi42LTYuNS0xLjUtMi4xLTMuMS0yLjQtNS44LTIuNC0xLjIgMC0yLjYgMS4xLTIuMyAyLjVsMy43IDE0LjNjLjMgMS4yIDEgMi40IDIuNCAyLjQiIGZpbGw9IiM4ZDhmOTMiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjxwYXRoIGQ9Ik01MzguMyAzNmMtMi0xMS4zIDYtMTggMTguMi03LjVhNDEgNDEgMCAwIDEgMTEuNyAzMS4xYy05LTIuNS0yOC4zLTE0LjItMzAtMjMuNiIgZmlsbD0iI2U5ZThlOCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTU2NS40IDE0My44YzEuNi0uNiAyLjUtMSAzLjQtMi42LjUtMSAxLjUtMi42IDEuNS01LjNhMTg5LjEgMTg5LjEgMCAwIDAgMC02NS4zYzAtMi43LTEtNC4zLTEuNS01LjNhNC41IDQuNSAwIDAgMC0zLjQtMi41IDE5NyAxOTcgMCAwIDEgNC41IDM5LjhjLjMgMTMuOS0yLjIgMjguOC00LjUgNDEuMyIgZmlsbD0iIzNiM2IzYyIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHJlY3Qgcnk9IjguMSIgcng9IjguMSIgaGVpZ2h0PSIxNi4zIiB3aWR0aD0iMzEwLjYiIHk9IjIyIiB4PSI1My43IiBmaWxsPSIjZDJkMmQxIi8+PHBhdGggZD0iTTI5Ny41IDI3Ljh2NC43YzAgMy4zLjMgNi4xLjUgNmgxLjhjLjQgMCAuNS0yLjYuNS02di01YzAtMy4zLS4zLTYtLjUtNkgyOThjLS4yIDAtLjUgMi44LS41IDYuMW00MC4yLjVWMzNjMCAzLjMgMCA2IC41IDZoMS43Yy4zIDAgLjUtMi42LjUtNnYtNWMwLTMuMy0uMi02LS41LTZIMzM4YTIzIDIzIDAgMCAwLS4zIDYuMW0tNzkuMy0uMnY0LjdjMCAzLjEuMyA1LjkuNSA1LjloMS44Yy4yIDAgLjUtMi42LjUtNS45VjI4YzAtMy4zLS4zLTUuOS0uNS01LjloLTEuOGMtLjIgMC0uNSAyLjUtLjUgNS45bS00MC43LjF2NC44YzAgMy4yLjIgNS44LjUgNS44aDEuN2MuMyAwIC41LTIuNS41LTUuOVYyOGMwLTMuMy0uMi01LjktLjUtNS45aC0xLjZjLS4zIDAtLjUgMi42LS41IDUuOW0tNDAgMHY0LjhjMCAzLjIuMiA1LjguNSA1LjhoMS43Yy4zIDAgLjUtMi41LjUtNS45VjI4YzAtMy4zLS4yLTUuOS0uNS01LjloLTEuN2MtLjMgMC0uNSAyLjYtLjUgNS45bS00MCAwdjQuOGMwIDMuMi4yIDUuOC41IDUuOGgxLjdjLjMgMCAuNS0yLjUuNS01LjlWMjhjMC0zLjMtLjItNS45LS41LTUuOWgtMS43Yy0uMyAwLS41IDIuNi0uNSA1LjkiIGZpbGw9IiM4ZDhmOTMiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjxyZWN0IHJ5PSI4LjEiIHJ4PSI4LjEiIGhlaWdodD0iMTYuMyIgd2lkdGg9IjMxMS44IiB5PSIxNjkiIHg9IjUyLjUiIGZpbGw9IiNkMmQyZDEiLz48cGF0aCBkPSJNMjk3LjUgMTc0Ljh2NC44YzAgMy4zLjMgNi4yLjUgNmgxLjhjLjQgMCAuNS0yLjYuNS02di01YzAtMy4yLS4zLTYtLjUtNkgyOThjLS4yIDAtLjUgMi44LS41IDYuMm00MC4yLjJ2NWMwIDMuMyAwIDYgLjUgNmgxLjdjLjMgMCAuNS0yLjYuNS02di01YzAtMy4zLS4yLTYtLjUtNkgzMzhhMjMgMjMgMCAwIDAtLjMgNi4xbS03OS4zLS4ydjQuN2MwIDMuMi4zIDUuOS41IDUuOWgxLjhjLjIgMCAuNS0yLjYuNS01LjlWMTc1YzAtMy4zLS4zLTUuOS0uNS01LjloLTEuOGMtLjIgMC0uNSAyLjUtLjUgNS45bS00MC43LjF2NC44YzAgMy4yLjIgNS44LjUgNS44aDEuN2MuMyAwIC41LTIuNS41LTUuOFYxNzVjMC0zLjMtLjItNS45LS41LTUuOWgtMS42Yy0uMyAwLS41IDIuNy0uNSA1LjltLTQwIDB2NC44YzAgMy4yLjIgNS44LjUgNS44aDEuN2MuMyAwIC41LTIuNS41LTUuOFYxNzVjMC0zLjMtLjItNS45LS41LTUuOWgtMS43Yy0uMyAwLS41IDIuNy0uNSA1LjltLTQwIDB2NC44YzAgMy4yLjIgNS44LjUgNS44aDEuN2MuMyAwIC41LTIuNS41LTUuOFYxNzVjMC0zLjMtLjItNS45LS41LTUuOWgtMS43Yy0uMyAwLS41IDIuNy0uNSA1LjkiIGZpbGw9IiM4ZDhmOTMiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==',
      scale: 0.00015,
    },
    title: shuttleData.properties.name,
    label: {
      color: '#333',
      fontWeight: 'bold',
      text: shuttleData.properties.name,
    },
    map,
  });
  markers[shuttleSnapshot.key] = marker;
  return marker;
}

function handleNewValue(shuttleSnapshot) {
  const shuttleData = shuttleSnapshot.val();
  if (!shuttleData.properties) return;
  const shuttleTimestamp = moment(shuttleData.properties.timestamp);
  const dataIsFresh = shuttleTimestamp.isAfter(now.subtract(DATA_TIMEOUT, 'seconds'));
  if (!markers[shuttleSnapshot.key]) {
    constructMarker(shuttleSnapshot);
  }
  markers[shuttleSnapshot.key].setVisible(dataIsFresh);
}

function initShuttleStopsLayer(shuttleStopsData) {
  shuttleStopsData.forEach((shuttleStop) => {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng({
        lat: shuttleStop.geometry.coordinates[0],
        lng: shuttleStop.geometry.coordinates[1],
      }),
      icon: {
        path: busSimple,
        fillOpacity: 0.8,
        scale: 0.015,
      },
      title: shuttleStop.properties.name,
      label: {
        color: '#333',
        fontWeight: 'bold',
        text: shuttleStop.properties.name,
      },
      map,
    });
    shuttleStopMarkers.push(marker);
  });
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
    center: new google.maps.LatLng('41.0115', '-76.449'),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: mapStyles,
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  const swBound = new google.maps.LatLng('41.005188', '-76.452374');
  const neBound = new google.maps.LatLng('41.019014', '-76.443321');
  map.fitBounds(new google.maps.LatLngBounds(swBound, neBound));

  const shuttleStopsRef = firebase.database().ref('bus-stations');
  shuttleStopsRef.once('value', (shuttleStopsSnapshot) => { initShuttleStopsLayer(shuttleStopsSnapshot.val()); });

  const shuttlesRef = firebase.database().ref('shuttles');
  shuttlesRef.on('value', (shuttlesSnapshot) => {
    now = moment();
    shuttlesSnapshot.forEach((shuttleSnapshot) => { handleNewValue(shuttleSnapshot); });
  });
  shuttlesRef.on('child_changed', (shuttlesSnapshot) => {
    now = moment();
    shuttlesSnapshot.forEach((shuttleSnapshot) => { handleNewValue(shuttleSnapshot); });
  });
}
