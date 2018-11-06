/** Function for creating a restaurant
 */
exports.create_restaurant = (req, res) => {
  res.end("create restaurant");
}

/** Functoin for gettting all info related to the restaurant
 */
exports.get_info = (req, res) => {
  const restaurant_id = req.params.restaurant_id;
  res.end("info for restaurant: " + restaurant_id);
}
