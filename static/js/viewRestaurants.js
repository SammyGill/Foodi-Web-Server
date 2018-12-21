function showDish(dishName) {
  document.getElementById("galleries").hidden = true;
  
  if ( document.getElementById(dishName) )
    document.getElementById(dishName).removeAttribute("hidden");
  else
    $('#'+dishName).removeAttr("hidden");
} 

function hideDish(dishName) {
  document.getElementById("galleries").hidden = false;

  let div;
  if ( document.getElementById(dishName) )
    div = document.getElementById(dishName);
  else
    div = $('#'+dishName);
  div.hidden = true;
}

// takes user to view specific post
$(document).ready( () => {
	const url = window.location.href;

  const split = url.split('#');
  if (split.length == 2){
    
    const arr = split[1].split('_');
    if (arr.length == 2) {
      const post_id = arr[0];
      const dish_name = arr[1].replace( new RegExp( '%20', 'ig' ) , "\\ " )
      
      // check if valid dish name and post id were passed in
      if ( $('#'+dish_name).length != 0 && $('#'+post_id).length != 0 ) {
        showDish(dish_name); // show all posts for that dish
        $('#'+post_id).click(); // click post to bring up modal
      }
      
    }
  }
})