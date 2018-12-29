let map = null;
let markers = [];
let infowindow = null;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13
  });

  google.maps.event.addListener(map,'dragend',getMoveData)

  var input = document.getElementById('pac-input');

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  infowindow = new google.maps.InfoWindow();

  if (navigator.geolocation) {    
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      let radius = getRadius();
      let request = {
        location: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
        radius: '5000',
        types: ['restaurant', 'food', 'cafe','bakery','bar']
      };

      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          let place_ids = [];
          results.forEach(place => {
            createMarker(place) 
            place_ids.push(place.place_id);
          });
          discoverRestaurants(place_ids);
        }
      });
      
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infowindow, map.getCenter());
      getMoveData();
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infowindow, map.getCenter());
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
    infowindowContent.children['place-address'].textContent =
        place.formatted_address;
    infowindow.open(map, marker);
    
    // takes user to the restaurant page when clicking on the autocomplete option
    viewRestaurant(place.place_id);
  })
}


/** Gets new restaurant in the area when the user moves the map */
function getMoveData() {
  clearMarkers()
  currentLocation = map.getCenter();
  newCurrLocation = currentLocation.toString();
  newCurrLocation = newCurrLocation.replace('(', '');
  newCurrLocation = newCurrLocation.replace(')', '');

  latlngArray = new Array();
  latlngArray = newCurrLocation.split(",")
  for (a in latlngArray) {
          latlngArray[a] = parseFloat(latlngArray[a]);
  }
  newLat = latlngArray[0]
  newLng = latlngArray[1]
  map.setCenter({lat : newLat,lng : newLng});

  showPlaces()
}

/** Function to determine radius to search places. Gets radius based on map window size.
 * Returns either the max radius of 3500m or the actual radius of the window size */
function getRadius() {
  let max_radius = 3500;
  
  let bounds = map.getBounds();
  let center = map.getCenter();
  let radius = max_radius;
  if (bounds && center) {
    // Calculate radius (in meters)
    radius = google.maps.geometry.spherical.computeDistanceBetween(center, bounds.getNorthEast());
  }

  return (radius > max_radius)? max_radius : radius; // make sure radius doesn't exceed max radius
}

// show marker for places in the area
function showPlaces() {
   request = {
    location: map.getCenter(),
    radius: getRadius(),
    types: ['restaurant', 'food', 'cafe','bakery','bar']
  };

  infowindow = new google.maps.InfoWindow();

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      let place_ids = [];
      results.forEach(place => {
        createMarker(place);
        place_ids.push(place.place_id);
      });
     discoverRestaurants(place_ids); 
    }
  });
}

/** Create the infowindow marker when clicking on the pinned restaurant on the map */
function createMarker(place) {
  var placeLoc = place.geometry.location;
  marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  markers.push(marker);

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(
      `<div>
        <strong>` + place.name + `</strong>
        <br>` +
        place.vicinity + 
        `<br>
         <a href="#" onClick="viewRestaurant('`+place.place_id+`')"> View restaurant </a>
      </div>`);
    infowindow.open(map, this);
  });  
}

/** Remove all markers from the map; invoked when user moves map area */
function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

/**
 * Function to take user to the restaurant page; first check if the restaurant exists,
 * if it does, then simply go to the page. If it doesn't, then create the restaurant 
 * before taking user to the page
 */
function viewRestaurant(id)  {
  checkRestaurantExists(id, (exists, err) => {
    if (exists && !err) {
      window.location.href = '/restaurants/' + place.place_id;
    }
    else if (!exists && !err) {
      let service = new google.maps.places.PlacesService(map);
      service.getDetails({
        placeId: id
      }, (place, status) => {
        createRestaurant(place, (success) => {
          if (success)
            window.location.href = '/restaurants/' + place.place_id;    
        });
      });
    }
  })  
}


/** function to discover restaurant. Gets top posts for each dish for 
 *  all restaurants in the area and display them. For example,
 *  if RestaurantA has dishes A, B, C, and RestaurantB has dishes D, E,
 *  then the top post for dishes A, B, C, D, E will be displayed
 */
function discoverRestaurants(place_ids) {
  $('#discover_restaurant_div').html('');
  $.ajax({
    url: '/api/restaurants/discover?restaurants=' + place_ids,
    dataType: "json",
    type: 'GET',
    beforeSend: function (xhr) {   //Include the bearer token in header
      xhr.setRequestHeader("Authorization", 'Bearer '+accessToken);
    },
    success: (data) => { // restaurant exists
      data.forEach(post => {
        appendPost('discover_restaurant_div', post);
      })
    },
    error: (err) => {
      const alertTitle = "Error " + err.status + ": " + err.statusText;
      const alertText = err.responseJSON.message;
      alertModal(alertTitle, alertText);
    }
  });
}

// append post to div to display them
function appendPost(div_id, post) {
  let htmlStr = 
  `<div id="post`+post.post_id+`" class = "post_pics" style="width: 100%; display:inline-block; text-align: center">
    <div class="card card_profile" style="margin-bottom:8rem;">
      <h6>`+post.restaurant_name+`</h6>
      <img class="card-img-top card-img_profile" src="/api/photos/`+post.picture+`" 
        alt="Not Found" onerror='this.onerror=null;this.src="/images/alt_img.png"' style="cursor:pointer">
    </div>
   </div>`;

  // onClick function for the post; shows modal when clicked
  let element = document.createElement('a');
  element.innerHTML = htmlStr;
  element.firstChild.addEventListener( 'click', () => {
    showModal(post.profile_picture, post.username, post.date, 
      post.picture, post.dish_name, post.caption, post.rating, 
      post.likes, post.dislikes, post.restaurant_id, post.restaurant_name,
      post.post_id, post.canEdit, post.liked, post.disliked);
  });

  $('#'+div_id).append( element.firstChild );
}

/** Funtion that invoke ajax call to determine if the restaurant already 
 *  exists in the database */
function checkRestaurantExists(restaurant_id, callback) {
  $.ajax({
    url: '/api/restaurants/' + restaurant_id,
    dataType: "json",
    type: 'GET',
    success: (data) => { // restaurant exists
      callback(true, false); //callback(exists:true, err:false)
    },
    error: (err) => {
      if (err.status == 404) { // restaurant doesn't exist; create restaurant
        callback(false, false); //callback(exists:false, err:false)
      }
      else { // other error
        const alertTitle = "Error " + err.status + ": " + err.statusText;
        const alertText = err.responseJSON.message;
        alertModal(alertTitle, alertText);
        callback(false, true); //callback(exists:false, err:true)
      }
    }
  });
}

/** Function to create restaurants; the "place" parameter contains info
 *  about the restaurant as provided by the Google API. The function sorts  
 *  the info into format that the backend requires then makes a POST request
 *  to create the restaurant 
 */
function createRestaurant(place, callback) {
  let restaurant = {};
  // grab restaurant info
  var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
  };

  // automatically fill in fields
  for (let i = 0; i < place.address_components.length; i++) {
    let addressType = place.address_components[i].types[0];

    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      restaurant[addressType] = val;
    }
  }
  
  const hours = place.opening_hours.weekday_text;
  restaurant['hours'] = '';
  for (let i = 0; i < hours.length; i++) {
    restaurant.hours += hours[i];
    if (i != hours.length - 1)
      restaurant.hours += ', ';
  }
  restaurant.restaurant_id = place.place_id;
  restaurant.phone_number = place.international_phone_number;
  restaurant.name = place.name;

  $.ajax({
    url: '/api/restaurants/create',
    type: 'POST',
    data: restaurant,
    success: (data) => { // restaurant successfully created
      callback(true); //callback(success:true)
    },
    error: (err) => { // error when creating restaurant 
      const alertTitle = "Error " + err.status + ": " + err.statusText;
      const alertText = err.responseJSON.message;
      alertModal(alertTitle, alertText);
      callback(false); //callback(success:false)
    }
  });
  
}



$(document).ready( () => {
  // so autocomplete works; dunno why this is needed
  jQuery.curCSS = function(element, prop, val) {
    return jQuery(element).css(prop, val);
  };

  getCookie = (name) => {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
  }
  const accessToken = getCookie('accessToken');


  //=================================================//
  //============= AUTOCOMPLETE FOR USER==============//
  //=================================================//

  /** autocomplete when searching for users */
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
    select: (event, ui) => { // goes to the profile page when selected
      window.location.href = "/profiles/" + ui.item.label;
    }
  })
  // add image to the autocomplete list and highlight (bold) matched text
  .data('autocomplete')._renderItem = (ul, item) => {
    // for highlighting matched text
    let regex = new RegExp( $('#input_user').val(), 'ig' );
    let str = item.label  + ' (' + item.first_name + ' ' + item.last_name; 
    
    // appending image and text
    let html = '<a><img src="' + item.profile_picture + '" alt="" style="width:10%; cursor:pointer"/></a> ';
    html += '<a style="cursor:pointer">' + str.replace( regex , "<b>$&</b>" ) + ')</a>';
    return $('<li>')
      .data('item.autocomplete', item)
      .append(html)
      .appendTo(ul);
  };



  //=================================================//
  //============= AUTOCOMPLETE FOR DISH==============//
  //=================================================//

  /** autocomplete when discovering dish */
  $("#input_dish").autocomplete({
    source: (request, response) => {
      $('#search_div').html(''); //clear div
      // get suggestions for the autocomplete
      $.ajax({
        url: '/api/dishes/suggestions?dish=' + request.term,
        dataType: "json",
        type: 'GET',
        success: (data) => {
          response(data);
        }
      });
    },
    select: (event, ui) => {
      $("#input_dish").val(ui.item.label); // fill in input with selected text

      // get top post of dish matching the search term from each restaurant
      $.ajax({
        url: '/api/dishes/search?dish=' + ui.item.label,
        dataType: "json",
        type: 'GET',
        beforeSend: function (xhr) {   //Include the bearer token in header
          xhr.setRequestHeader("Authorization", 'Bearer '+accessToken);
        },
        success: (data) => {
          $('#search_div').html(''); //clear div

          // append each post to the div
          data.posts.forEach( post => {
            appendPost('search_div', post);
          })
          
        }
      });
    }
  });

});