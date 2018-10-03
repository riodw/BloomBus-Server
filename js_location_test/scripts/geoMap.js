/* global document, google, navigator, firebase */
const mapCanvas = document.getElementById('map_canvas');
const geoBtn = document.querySelector('.enable');
const shuttleTypeRef = document.getElementById('shuttle-type');
geoBtn.onclick = function () {
  console.log('Permission currently denied; future features of the Permissions API will allow us to request permission here.');
  console.log('Currently you have to reset the permission state using the browser UI.');
  console.log('In Firefox it is done with Tools > Page Info > Permissions > Access Your Location.');
};

function report(state) {
  console.log(`Permission: ${state}`);
}

const positionDenied = function () {
  geoBtn.style.display = 'inline';
};

const revealPosition = (position) => {
  console.log(position);
  geoBtn.style.display = 'none';
  const markerTitle = 'You are here';

  const latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  const myOptions = {
    zoom: 16,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };

  const map = new google.maps.Map(mapCanvas, myOptions);

  const marker = new google.maps.Marker({
    position: latlng,
    map,
    title: markerTitle,
  });

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
  return firebase.database().ref().update(updates);
};

// test for geolocation support
if (!('geolocation' in navigator)) {
  alert('No geolocation available!');
}
// provide geolocation settings
const geoSettings = {
  enableHighAccuracy: false,
  maximumAge: 30000,
  timeout: 20000,
};

// Start everything off
// determine location of the user's device
function handlePermission() {
  navigator.permissions.query({ name: 'geolocation' }).then((result) => {
    if (result.state === 'granted') {
      report(result.state);
      geoBtn.style.display = 'none';
    } else if (result.state === 'prompt') {
      report(result.state);
      navigator.geolocation.watchPosition(revealPosition, positionDenied, geoSettings);
    } else if (result.state === 'denied') {
      report(result.state);
      geoBtn.style.display = 'inline';
    }
    result.onchange = () => {
      report(result.state);
    };
  });
}

handlePermission();
