


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
      alert(JSON.stringify(data));
    },
    error: (err) => {
      alert(JSON.stringify(err));
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
      alert(JSON.stringify(data));
    },
    error: (err) => {
      alert(JSON.stringify(err));
    }
  });

}
