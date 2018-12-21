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


  $("#file").change(function(e) {
    console.log("HEREEEEE");
    for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {        
        var file = e.originalEvent.srcElement.files[i];       
        var reader = new FileReader();
        reader.onloadend = function() {
             $("#picture1").attr('src', reader.result);
             $("#picture1").show();
             localStorage.setItem("post_picture", getBase64Image($("#picture1")));
        }
        reader.readAsDataURL(file);
    }
  });

  function getBase64Image(img){
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  function fetchImage(){
    var dataImage = localStorage.getItem('post_picture');
    img.src = "data:image/png;base64," + dataImage;
  }
});


function checkRestaurantExists(restaurant) {
    $.ajax({
      url: '/api/restaurants/' + restaurant.restaurant_id,
      dataType: "json",
      type: 'GET',
      success: (data) => { // restaurant exists
        console.log('restaurant exists');
      },
      error: (err) => {
        if (err.status == 404) { // restaurant doesn't exist; create restaurant
          createRestaurant(restaurant);
        }
        else { // other error
          const alertTitle = "Error " + err.status + ": " + err.statusText;
          const alertText = err.responseJSON.message;
          alertModal(alertTitle, alertText);
        }
      }
    });
  }

  function createRestaurant(restaurant) {
  $.ajax({
    url: '/api/restaurants/create',
    type: 'POST',
    data: restaurant,
    success: (data) => { // restaurant successfully created
      console.log('restaurant created');
    },
    error: (err) => { // error when creating restaurant 
      const alertTitle = "Error " + err.status + ": " + err.statusText;
      const alertText = err.responseJSON.message;
      alertModal(alertTitle, alertText);
    }
  });
  
}


  function createPost(){
    getCookie = (name) => {
      var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
    }
    const access_token = getCookie('accessToken');

    console.log('createPost()');
    console.log($("#restaurant_id2").val());
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
        let url = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
        url += '/restaurants/' + $('#restaurant_id2').val() + '#post' + data.post_id + '_' + $('#dish_name').val();
        
        // go to restaurant page to view post
        window.location.href = url;

        // go to feed page to view post
        window.location.href = '/';

      },
      error: (err) => {
        alert(JSON.stringify(err));
      },
      cache: false,
      contentType: false,
      processData: false
    });
  }


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
    $("#dish_name").show();
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
    
    // check if restaurant exists; if it doesn't, create restaurant
    checkRestaurantExists(restaurant, (success) => {
      // go to the restaurant page
      if (success) {
        window.location.href = '/restaurants/' + place.place_id;
      }   
    });

    $("#name").val(place.name);
    $("#restaurant_id2").val(place.place_id);
    console.log($("#restaurant_id2").val());


  })
    
}

// function initMap() {
//   var map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: -33.8688, lng: 151.2195},
//     zoom: 13
//   });

//   var input = document.getElementById('pac-input');
//   var autocomplete = new google.maps.places.Autocomplete(input);
//   autocomplete.bindTo('bounds', map);
//   map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

//   var infowindow = new google.maps.InfoWindow();
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       var pos = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//       };
//       map.setCenter(pos);
//     }, function() {
//         handleLocationError(true, infoWindow, map.getCenter());});
//   } 
//   else {
//     // Browser doesn't support Geolocation
//     handleLocationError(false, infoWindow, map.getCenter());
//   }
//   var infowindowContent = document.getElementById('infowindow-content');
//   infowindow.setContent(infowindowContent);
//   var marker = new google.maps.Marker({
//      map: map
//   });
//   marker.addListener('click', function() {
//     infowindow.open(map, marker);
//   });
//   autocomplete.addListener('place_changed', function() {
//       $("#dish_name").show();
//   $("#enter_dish_name").show();
//   infowindow.close();
//   var place = autocomplete.getPlace();

//   if (!place.geometry) {
//     return;
//   }

//   if (place.geometry.viewport) {
//     map.fitBounds(place.geometry.viewport);
//   } else {
//     map.setCenter(place.geometry.location);
//     map.setZoom(17);
//   }

//   // Set the position of the marker using the place ID and location.
//   marker.setPlace({
//     placeId: place.place_id,
//     location: place.geometry.location
//   });
//   marker.setVisible(true);

//   infowindowContent.children['place-name'].textContent = place.name;
//   //infowindowContent.children['place-id'].textContent = place.place_id;
//   infowindowContent.children['place-address'].textContent =
//   place.formatted_address;
//   infowindow.open(map, marker);
//   });


//   let restaurant = {};
//   // grab restaurant info
//   var componentForm = {
//     street_number: 'short_name',
//     route: 'long_name',
//     locality: 'long_name',
//     administrative_area_level_1: 'short_name',
//     country: 'long_name',
//     postal_code: 'short_name'
//   };

//   // automatically fill in fields
//   for (let i = 0; i < place.address_components.length; i++) {
//     let addressType = place.address_components[i].types[0];

//     if (componentForm[addressType]) {
//       var val = place.address_components[i][componentForm[addressType]];
//       restaurant[addressType] = val;
//     }
//   }
  
//   const hours = place.opening_hours.weekday_text;
//   restaurant['hours'] = '';
//   for (let i = 0; i < hours.length; i++) {
//     restaurant.hours += hours[i];
//     if (i != hours.length - 1)
//       restaurant.hours += ', ';
//   }
//   restaurant.restaurant_id = place.place_id;
//   restaurant.phone_number = place.international_phone_number;
//   restaurant.name = place.name;
  
//   /* information for creating a restaurant */
//   $("#name").val(place.name);
//   $("#restaurant_id2").val(place.place_id);
//   console.log($("#restaurant_id2").val());

//   checkRestaurantExists(restaurant);
  

// }    



