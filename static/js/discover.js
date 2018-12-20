function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13
  });

  var input = document.getElementById('pac-input');

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var infowindow = new google.maps.InfoWindow();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
    map: map
  });
  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });

  autocomplete.addListener('place_changed', function() {
    infowindow.close();
    var place = autocomplete.getPlace();
    var restaurant = {};
    var a = place.address_components;
    $('#restaurant_id').val(place.place_id);
    if (!place.geometry) {
      return;
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    // Set the position of the marker using the place ID and location.
    marker.setPlace({
      placeId: place.place_id,
      location: place.geometry.location
    });
    marker.setVisible(true);

    infowindowContent.children['place-name'].textContent = place.name;
//infowindowContent.children['place-id'].textContent = place.place_id;
    infowindowContent.children['place-address'].textContent =
        place.formatted_address;
    infowindow.open(map, marker);
  });
}

// so autocomplete works; dunno why this is needed
jQuery.curCSS = function(element, prop, val) {
  return jQuery(element).css(prop, val);
};

$(function() {
  $("#input_user").autocomplete({
    source: (request, response) => {
      $.ajax({
        url: '/api/profiles/suggestions?user='+request.term,
        dataType: "json",
        type: 'GET',
        success: (data) => {
          response($.map(data, (item) => {
            return {
              label : item.username,
              first_name: item.first_name,
              last_name: item.last_name,
              profile_picture: item.profile_picture
            };
          }));
        }
      });
    },
    select: (event, ui) => {
      window.location.href = "/profiles/" + ui.item.label;
    }
  }).data('autocomplete')._renderItem = (ul, item) => {
    let regex = new RegExp( $('#input_user').val(), 'ig' );
    let str = item.label  + ' (' + item.first_name + ' ' + item.last_name; 
    
    let html = '<a><img src="' + item.profile_picture + '" alt="" style="width:10%; cursor:pointer"/></a> ';
    html += '<a style="cursor:pointer">' + str.replace( regex , "<b>$&</b>" ) + ')</a>';
    return $('<li>')
      .data('item.autocomplete', item)
      .append(html)
      .appendTo(ul);
  };;

});

