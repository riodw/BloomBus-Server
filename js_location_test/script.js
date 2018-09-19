/* global document, navigator, firebase */

const coordsRef = document.getElementById('coords');
const shuttleTypeRef = document.getElementById('shuttle-type');

function geoSuccess(position) {
  const updates = {};
  const shuttleType = shuttleTypeRef.options[shuttleTypeRef.selectedIndex];
  updates[`/shuttles/${shuttleType.value}`] = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)],
    },
    properties: {
      name: shuttleType.text,
      timestamp: position.timestamp,
      speed: position.coords.speed,
      altitude: position.coords.altitude,
    },
  };
  coordsRef.innerHTML = `${position.coords.latitude}, ${position.coords.longitude}`;
  return firebase.database().ref().update(updates);
}

function geoError() {
  console.error('No position available.');
}

const geoOptions = {
  enableHighAccuracy: true, 
  maximumAge: 30000,
  timeout: 27000,
};    

if ('geolocation' in navigator) {
  /* geolocation is available */
  document.write('<p class="good">geolocation available</p>');
  navigator.geolocation.watchPosition(geoSuccess, geoError, geoOptions);
} else {
  /* geolocation IS NOT available */
  document.writeln('<p class="bad">geolocation available</p>');
}