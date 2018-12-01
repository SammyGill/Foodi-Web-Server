
  $(document).ready( () => {
    getCookie = (name) => {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
    }
    const access_token = getCookie('accessToken');
    


  var current_fs, next_fs, previous_fs;
  var left, opacity, scale;
  var animating;



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
          url: '/api/restaurants/' + $('#restaurant_id').val() + '/dish-list',
          type: 'GET',
          dataType: 'json',
          success: (data) => {
            response(data.dish_names);
          }
        })
      }
    });

  $(".submit").click(function(){
      var formData = new FormData(this);
      console.log(formData);      
      const access_token = access_token;
      $.ajax({
        url: '/api/posts/create',
        type: 'POST',
        data: formData,
        beforeSend: function (xhr) {   //Include the bearer token in header
          xhr.setRequestHeader("Authorization", 'Bearer '+access_token);
        },
        success: (data) => {},
        error: (err) => {
          alert(JSON.stringify(err));
        },
        cache: false,
        contentType: false,
        processData: false
      });
  });
        
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
          $("#dish_name").show();
        });
      }