window.onload = function () {
  var header = document.querySelector('.header');
  var burger = document.querySelector('.header__burger-wrap');

  burger.addEventListener('click', function () {
    header.classList.toggle('active');
  });

  svg4everybody();
};

var map;
function initMap() {
  var image = 'img/icon-map-marker.svg';
  var myLatLng = {lat: 59.9362413, lng: 30.3210924};

  map = new google.maps.Map(document.getElementById('mapMap'), {
    center: myLatLng,
    scrollwheel: false,
    // disableDefaultUI: true,
    zoom: 17
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    icon: image
  });

  google.maps.event.addListener(map, 'mouseout', function(){
    this.setOptions({scrollwheel:false});
  });

  map.addListener('click', function() {
    map.set('scrollwheel', true);
  });
}
