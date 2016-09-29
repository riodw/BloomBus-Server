/**
 * GOOGLE MAPS
 * initMap() - happens on callback of load "https://maps.googleapis.com/maps/api/js&callback=initMap"
 */
 
function initMap() {

   /* position Amsterdam */
   var latlng = new google.maps.LatLng(52.3731, 4.8922);

   var mapOptions = {
      center: latlng,
      scrollWheel: false,
      zoom: 13
   };

   var marker = new google.maps.Marker({
      position: latlng,
      url: '/',
      animation: google.maps.Animation.DROP
   });

   var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
   marker.setMap(map);

}
/* ./END - google maps*/