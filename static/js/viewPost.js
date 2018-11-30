$(document).ready( () => {
      
  getCookie = (name) => {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
  }
  const accessToken = getCookie('accessToken');
  
  var index = 0;

  $("#btn").on('click', function () {
    const post_id = $('#post_id').val();

    $.ajax({
      url: '/api/posts/'+post_id,
      type: 'GET',
      datatype: 'json',
      success: (data) => {
        $('#post_info').show();
        $('#like_dislike_delete').show();

        
        $('#postid').text("Post ID: " + data.post_id);
        $('#restaurant_id').text("Restaurant ID: " + data.restaurant_id);
        $('#dish').text("Dish name: " + data.dish_name);
        $('#author').text("Author ID: " + data.author_id);
        $('#post_caption').text("Caption: " + data.caption);
        $('#post_rating').text("Rating: " + data.rating);
        $('#post_date').text("Post date: " + data.date);
        $('#image').attr('src', '/api/photos/' + data.picture);
        $('#likes').text("Likes: " + data.likes);
        $('#dislikes').text("Dislikes: " + data.dislikes);
        index = 0;
        $('#comments_container').html('<p id="comments"> Comments: <button id="load_initial">Click here to load comments!</button></p>');
      },
      error: (err) => {
        $('#post_info').hide();
        $('#like_dislike_delete').hide();

      }
    });
    
  });  

  like = (post_id) => {

    $.ajax({
      url: '/api/posts/' + post_id + '/like',
      type: 'POST',
      beforeSend: function (xhr) {   //Include the bearer token in header
        xhr.setRequestHeader("Authorization", 'Bearer '+accessToken);
      },
      success: (data) => {
        $('#likes').text("Likes: " + data.updated_val.likes);
      },
      error: (err) => {
        alert(err.responseText.message);
      },
    });
  };

  dislike = (post_id) => {

    $.ajax({
      url: '/api/posts/' + post_id + '/dislike',
      type: 'POST',
      beforeSend: function (xhr) {   //Include the bearer token in header
        xhr.setRequestHeader("Authorization", 'Bearer '+accessToken);
      },
      success: (data) => {
        $('#dislikes').text("Dislike: " + data.updated_val.dislikes);
      },
      error: (err) => {
        alert(err.responseText);
      },
    });
  };

  $('#delete').click( () => {

    $.ajax({
      url: '/api/posts/' + $('#post_id').val() + '/delete',
      type: 'DELETE',
      beforeSend: function (xhr) {   //Include the bearer token in header
        xhr.setRequestHeader("Authorization", 'Bearer '+accessToken);
      },
      success: (data) => {
        alert("post deleted");
        $('#btn').click(); // click search button
      },
      error: (err) => {
        alert(err.responseText);
      },
    });
  })

  comment = (post_id) => {
    $.ajax({
      url: '/api/comments/create',
      type: 'POST',
      data: {
        comment_text: $('#comment_text').val(),
        post_id: post_id
      },
      datatype: 'json',
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", 'Bearer ' + accessToken);
      },
      success: (data) => {
        alert("added comment");
      },
      error: (err) => {
        alert(JSON.stringify(err));
      }
    });  
  }
  
  
  // called first time loading comments
  $(document).on("click", "#load_initial", function() {
    toloadComments();
  })

  // load more comments
  $(document).on("click", "#load_more", function() {
    $(this).closest("#load_more").remove();
    toloadComments();     
  })

}); 