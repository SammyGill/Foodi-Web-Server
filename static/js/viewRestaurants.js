function showDish(dishName) {
  document.getElementById("galleries").hidden = true;
  document.getElementById(dishName).hidden = false;
// document.getElementById("galleries").style.display = "none";
} 

function hideDish(dishName) {
  document.getElementById("galleries").hidden = false;
  document.getElementById(dishName).hidden = true;
  // document.getElementById("galleries").style.display = "block";
}

$(document).ready( () => {
	const url = window.location.href;

  const split = url.split('#');
  if (split.length == 2){
    
    const arr = split[1].split('_');
    if (arr.length == 2) {
      const post_id = arr[0];
      const dish_name = arr[1];
      showDish(dish_name);
      $('#'+post_id).click();

    }
  }
})