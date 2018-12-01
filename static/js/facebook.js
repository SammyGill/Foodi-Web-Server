let accessToken = "";
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

function statusChangeCallback(response) {
  accessToken = response.authResponse.accessToken;
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    console.log('Successfully logged in with Facebook');
    signin(accessToken);
  }
}


function signin(accessToken) {
  $.ajax({
    url: '/set-cookie',
    type: 'POST',
    datatype:'json',
    beforeSend: (xhr) => {   //Include the bearer token in header
      xhr.setRequestHeader("Authorization", 'Bearer '+accessToken);
    },
    success: (data) => {
      
      $.ajax({
        url: '/api/accounts/signin',
        type: 'POST',
        datetype: 'json',
        beforeSend: (xhr) => {   //Include the bearer token in header
          xhr.setRequestHeader("Authorization", 'Bearer '+accessToken);
        },
        success: (data, textStatus, xhr) => {
          $('#name').text(data.userData.first_name + data.userData.last_name);
          $('#user_id').text(data.userData.id);
          $('#pic').attr('src', data.userData.picture.data.url);
          console.log(data.userData);
          if (xhr.status == 201) {
            // document.cookie = "username="+data.userData.username;
            alert("Hi " + data.userData.first_name +"! Your current username is " + data.userData.username + ". You can change it below");
            $('#username_div').show();
          }
          else {
            alert("Welcome back " + data.userData.first_name);
            // document.cookie = "username="+data.userData.username;
            location.href = "/";
          }
        },
        error: (err) => {
          alert(JSON.stringify(err));
        }
      });  

    },
    error: (err) => {
      alert(JSON.stringify(err));
    }
  });
}
$(document).ready( ()=> {

  $('#btn').click( ()=> {
    
    const username = $('#username').val();
    const body = {username: username};
    $.ajax({
      url: '/api/profiles/set-username',
      type: 'POST',
      datatype: 'json',
      data: body,
      beforeSend: (xhr) => {   //Include the bearer token in header
        xhr.setRequestHeader("Authorization", 'Bearer '+accessToken);
      },
      success: (data) => {
        alert('username set');
        // document.cookie = "username="+username;
        location.href = "/";
      },
      error: (err) => {
        alert(JSON.stringify(err));
      }
    });

  });

});