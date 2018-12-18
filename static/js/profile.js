


function follow(user_id) {
  getCookie = (name) => {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
  }
  const access_token = getCookie('accessToken');

  $.ajax({
    url: '/api/profiles/follow/' + user_id,
    type: 'POST',
    datetype: 'json',
    beforeSend: (xhr) => {   //Include the bearer token in header
      xhr.setRequestHeader("Authorization", 'Bearer '+ access_token);
    },
    success: (data, textStatus, xhr) => {
      location.reload();
    },
    error: (err) => {
      const alertTitle = "Error " + err.status + ": " + err.statusText;
      let alertText = err.responseJSON.error.message;
      if (err.responseJSON.error.code == 190)
        alertText += " Please log in and try again."
      alertModal(alertTitle, alertText);
    }
  });

}


function unfollow(user_id) {
  getCookie = (name) => {
  var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
  }
  const access_token = getCookie('accessToken');

  $.ajax({
    url: '/api/profiles/unfollow/' + user_id,
    type: 'POST',
    datetype: 'json',
    beforeSend: (xhr) => {   //Include the bearer token in header
      xhr.setRequestHeader("Authorization", 'Bearer '+ access_token);
    },
    success: (data, textStatus, xhr) => {
      location.reload();
    },
    error: (err) => {
      const alertTitle = "Error " + err.status + ": " + err.statusText;
      let alertText = err.responseJSON.error.message;
      if (err.responseJSON.error.code == 190)
        alertText += " Please log in and try again."
      alertModal(alertTitle, alertText);
    }
  });

}
