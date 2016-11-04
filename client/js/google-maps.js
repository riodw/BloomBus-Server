// This example creates a 2-pixel-wide red polyline showing the path of William
// Kingsford Smith's first trans-Pacific flight between Oakland, CA, and
// Brisbane, Australia.


// Initialize Firebase
var config = {
   apiKey: "AIzaSyAEjUTZ2gaGFov0ab4wI6wXQ2nxwC_DVxk",
   authDomain: "bloombus-68ea7.firebaseapp.com",
   databaseURL: "https://bloombus-68ea7.firebaseio.com"
};
firebase.initializeApp(config);

// Day key logic
var dateKey;
// var timeKey;
function getNewTime() {
   var date = new Date().toISOString();
   date = date.split('T');
   dateKey = date[0];
   // timeKey = date[1];
   // timeKey = timeKey.split('.');
   // timeKey = timeKey[0];
   return String(dateKey);
}
console.log(getNewTime());

var database = firebase.database().ref('bus_data/' + getNewTime());



/*-------------------------------
MAGIC CODE THAT MAKES IT ALL WORK
--------------------------------*/
var map = undefined;
var marker = undefined;
var position = [41.008528, -76.446415];
// GOOGLE MAPS
function initMap() {

   // Starting Position
   var latlng = new google.maps.LatLng(position[0], position[1]);
   // Google Maps Options
   var myOptions = {
      zoom: 15,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
   };

   map = new google.maps.Map(document.getElementById('map'), myOptions);
   
   marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: "Your current location!"
   });
        
        
   
   // Stuff for Firebase Loop
   var buspath = [];
   var newpath = undefined;
   // Document Element Valiables
   var ul = document.getElementById("list");
   var live = document.getElementById("live");
   // all records after the last continue to invoke this function
   database.limitToLast(1).on('child_added', function(snapshot) {

      // Update Live Feed
      if(live.style.display == 'block') {
         var li = document.createElement("li");
         li.innerHTML = snapshot.val();
         ul.appendChild(li);
      }

      if(snapshot.val().includes("LALO")) {
         newpath = snapshot.val().split("LALO");
         newpath = newpath[1].split(",");
         if(newpath[0].includes("(")) {
            newpath = newpath[0].substring(1, newpath[0].length - 1);
            if(newpath.includes("%")) {
               newpath = newpath.split("%");
               newpath[1] = "-" + newpath[1];
               console.log(newpath);
               buspath.push(newpath);
               
               // Update position
               transition(newpath);
            }
         }
      }
   });
}

var numDeltas = 100;
var delay = 10; //milliseconds
var i = 0;
var deltaLat;
var deltaLng;

function transition(result) {
   i = 0;
   deltaLat = (result[0] - position[0]) / numDeltas;
   deltaLng = (result[1] - position[1]) / numDeltas;
   moveMarker();
}

function moveMarker() {
   position[0] += deltaLat;
   position[1] += deltaLng;
   var latlng = new google.maps.LatLng(position[0], position[1]);
   marker.setPosition(latlng);
   if(i != numDeltas) {
      i++;
      setTimeout(moveMarker, delay);
   }
}