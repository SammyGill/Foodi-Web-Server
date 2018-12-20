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