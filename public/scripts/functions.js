///////////////////////////////////////////////////////////////////////
//Express.js Configuration
///////////////////////////////////////////////////////////////////////
/*
function initialize() {
	var input = document.getElementById('myLocation');
	var autocomplete = new google.maps.places.Autocomplete(input);
}

google.maps.event.addDomListener(window, 'load', initialize);

*/


/*
Below 3 functions are for routing the submit button to differet pages even when there is only one form on the /home page
So right now the default is to submit to /emergency but if other buttons are clicked, the button's action attribute is changed
*/

$("#emergencyBtn").on('click', function() {
  $("#locationSubmit").attr("action", "/emergency");
});
$("#dangerBtn").on('click', function() {
  $("#locationSubmit").attr("action", "/danger");
});
$("#friendsBtn").on('click', function() {
  $("#locationSubmit").attr("action", "/friends");
});

/*
Below 3 are for toggling safety tips on the /tips page
*/

$("#alcPoisonBtn").click(function(){
	$("#sexualAssault").hide();
	$("#firstAid").hide();
    $("#alcPoison").toggle();
});

$("#sexualAssaultBtn").click(function(){
    $("#alcPoison").hide();
	$("#firstAid").hide();
    $("#sexualAssault").toggle();
});

$("#firstAidBtn").click(function(){
	$("#alcPoison").hide();
	$("#sexualAssault").hide();
    $("#firstAid").toggle();
});

/*
Below method is to ensure that pressing enter takes you to the next form field instead of submitting the form!!!
*/
$(document).ready(function() {
	var currentBoxNumber = 0;
	$(".form-control").keydown(function (event) {
		console.log(event)
	    if (event.keyCode == 13) {
	        textboxes = $(".form-control");
	        currentBoxNumber = textboxes.index(this);
	        console.log(textboxes, textboxes.index(this));
	        if (textboxes[currentBoxNumber + 1] != null) {
	            nextBox = textboxes[currentBoxNumber + 1];
	            nextBox.focus();
	            nextBox.select();
	            event.preventDefault();
	            return false;
	        }
	    }
	});
});