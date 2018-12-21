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

  // append post to div when selecting
  function appendPost(div_id, post) {
    let htmlStr = 
    `<div id="post`+post.post_id+`" class = "post_pics" style="width: 40%; display:inline-block; text-align: center">
      <div class="card card_profile" style="margin-bottom:100px;">
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