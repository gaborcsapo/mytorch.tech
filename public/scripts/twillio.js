function text_emergency(){  
    /*getting location from input form*/
    var location =  $('#searchTextField').val();
    
    $.ajax({
      method: "POST", 
      url: "/emergency", 
      data: {'location': location} 
    }).done(function(response){
      window.location.href = '/emergency';
    });
  }