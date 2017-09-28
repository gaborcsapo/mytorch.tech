
/*
function initialize() {
	var input = document.getElementById('myLocation');
	var autocomplete = new google.maps.places.Autocomplete(input);
}

google.maps.event.addDomListener(window, 'load', initialize);

*/

$("#emergencyBtn").on('click', function() {
  $("#locationSubmit").attr("action", "/emergency");
});
$("#dangerBtn").on('click', function() {
  $("#locationSubmit").attr("action", "/danger");
});
$("#tipsBtn").on('click', function() {
  $("#locationSubmit").attr("action", "/tips");
});