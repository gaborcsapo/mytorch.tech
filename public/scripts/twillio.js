
console.log('found')
function text_emergency(){  
    var location = 'daaaaaa'
    
    $.ajax({
      method: "POST", 
      url: "/emergency", 
      data: {'location': location} 
    }).done(function(response){
      console.log('req sent');
    });
  }