function text_emergency(){  
    /*getting location from input form*/
    var location =  $('#myLocation').val();
    
    $.ajax({
      method: "GET", 
      url: "/emergency", 
      data: {'location': location} 
    }).done(function(response){
      window.location.href = '/emergency';
    });
  }