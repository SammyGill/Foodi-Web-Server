$(document).ready( () => {
  document.querySelector("#date").valueAsDate = new Date();
  var current_fs, next_fs, previous_fs;
  var left, opacity, scale;
  var animating;


  $(".btnrating").on('click',(function(e) {
    var previous_value = $("#selected_rating").val();
    var selected_value = $(this).attr("data-attr");
    $("#selected_rating").val(selected_value);
    $(".selected-rating").empty();
    $(".selected-rating").html(selected_value);
    for (i = 1; i <= selected_value; ++i) {
      $("#rating-star-"+i).toggleClass('btn-warning');
      $("#rating-star-"+i).toggleClass('btn-default');
    }
    for (ix = 1; ix <= previous_value; ++ix) {
      $("#rating-star-"+ix).toggleClass('btn-warning');
      $("#rating-star-"+ix).toggleClass('btn-default');
    }
    rating_val = selected_value;
  }));

  $(".next").click(function(){
    if(animating) return false;
    animating = true;
    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");
    next_fs.show();
    current_fs.animate({opacity: 0}, {
      step: function(now, mx) {
        scale = 1 - (1-now) * 0.2;
        left = (now * 50) + "%";
        opacity = 1-now;
        current_fs.css({
          'transform': 'scale('+scale+')',
          'position': 'absolute'
        });
        next_fs.css({'left': left, 'opacity': opacity});
      },
      duration: 800,
      complete: function(){
        current_fs.hide();
        animating = false;
      },
      easing: 'easeInOutBack'
      });
  });
  
  $(".previous").click(function(){
    if(animating) return false;
    animating = true;
    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");
    previous_fs.show();
    current_fs.animate({opacity: 0}, {
      step: function(now, mx) {
        scale = 0.8 + (1-now) * 0.2;
        left = ((1-now) * 50) + "%";
        opacity = 1-now;
        current_fs.css({'left': left});
        previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity});
      },
      duration: 600,
      complete: function(){
        current_fs.hide();
        animating = false;
      }
    });
  });
    
  $( "#dish_name" ).autocomplete({
    source: (request, response) => {
      alert($('#restaurant_id2').val());
       $.ajax({
        url: '/api/restaurants/' + $('#restaurant_id2').val() + '/dish-list',
        type: 'GET',
        dataType: 'json',
        success: (data) => {
          response(data.dish_names);
        }
      })
    }
  });

  $("form#data").submit(function(e){
    e.preventDefault();
    const url = '/api/restaurants/' + $('#restaurant_id2').val();
    $.ajax({
      url: url,
      type: 'GET',
      success: (data) => {
          createPost();
      },
      error: (err) =>{
          createRestaurant();
          createPost();
      }
    });     
  });

function createRestaurant(){
  $.ajax({
    url: '/api/restaurants/create',
    type: 'POST',
    data: {
      name: $("#name").val(),
      restaurant_id: $('#restaurant_id2').val(),
      street_number: $("#street_number").val(),
      route: $("#route").val(),
      neighborhood: $("#neighborhood").val(),
      locality: $("#locality").val(),
      administrative_area_level_1: $("#administrative_area_level_1").val(),
      country: $("#country").val(),
      postal_code: $("#postal_code").val(),
      phone_number: $("#phone_number").val(),
      hours: $("#hours").val()
    },
    success: (data) => {
      console.log("*** NEW RESTAURANT CREATED ***");
    },
    error: (err) => {
      alert(JSON.stringify(err));
    }
  });
}


function createPost(){
  getCookie = (name) => {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
  }
  const access_token = getCookie('accessToken');

  let formData = new FormData();
  formData.append('restaurant_id', $('#restaurant_id2').val());
  formData.append('restuarnat_name', $('#name').val());
  formData.append('dish_name', $('#dish_name').val());
  formData.append('image', $('#file').prop('files')[0]);
  formData.append('date', $('#date').val());
  formData.append('rating', parseInt(rating_val));
  formData.append('caption', $('#caption').val());  
  $.ajax({
      url: '/api/posts/create',
      type: 'POST',
      data: formData,
      beforeSend: function (xhr) {   //Include the bearer token in header
        xhr.setRequestHeader("Authorization", 'Bearer '+access_token);
      },
      success: (data) => {
        console.log("*** POST CREATED ***");
        location.href = '/'
      },
      error: (err) => {
        alert(JSON.stringify(err));
      },
      cache: false,
      contentType: false,
      processData: false
  });
}
    
});

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
        handleLocationError(true, infoWindow, map.getCenter());});
  } 
  else {
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
  const hours = place.opening_hours.weekday_text;
  var parsed_hours = hours[0] + '\n' + hours[1] + '\n' + hours[2] + '\n' +hours[3] + '\n' +hours[4] + '\n' +hours[5] + '\n' +hours[6];
  
  /* information for creating a restaurant */
  $("#name").val(place.name);
  $("#restaurant_id2").val(place.place_id);
  $("#street_number").val(place.address_components[1]['short_name']);
  $("#route").val(place.address_components[2]['long_name']);
  $("#neighborhood").val(place.address_components[3]['long_name']);
  $("#locality").val(place.address_components[4]['long_name']);
  $("#administrative_area_level_1").val(place.address_components[4]['long_name']);
  $("#country").val(place.address_components[7]['long_name']);
  $("#postal_code").val(place.address_components[8]['short_name']);
  $("#phone_number").val(place.international_phone_number);
  $("#hours").val(parsed_hours);


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
  $("#dish_name").show();
  $("#enter_dish_name").show();
  });
}


