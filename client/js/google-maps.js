
function initialize() {
  var map = new google.maps.Map(
    document.getElementById("map_canvas"), {
      center: new google.maps.LatLng(37.4419, -122.1419),
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
  var poly = new google.maps.Polyline({
    map: map,
    path: []
  })
  google.maps.event.addListener(map, 'click', function(evt) {
    // get existing path
    var path = poly.getPath();
    // add new point (use the position from the click event)
    path.push(new google.maps.LatLng(evt.latLng.lat(), evt.latLng.lng()));
    // update the polyline with the updated path
    poly.setPath(path);
  })
}
google.maps.event.addDomListener(window, "load", initialize);