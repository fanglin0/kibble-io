$.ajax({
  method: 'GET',
  url: 'https://api.api-ninjas.com/v2/randomword',
  headers: { 'X-Api-Key': 'jCKqq8AZmRTaocR3IXQEBtLnPtOe30GtBUw1uDfo'},
  contentType: 'application/json',
  success: function(result) {
      console.log(result);
  },
  error: function ajaxError(jqXHR) {
      console.error('Error: ', jqXHR.responseText);
  }
});

const randomWord = document.querySelector('')