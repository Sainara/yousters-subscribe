$(document).ready(function () {
    "use strict";

    var sessionID = "";

    $('#api_submit').on('click', function() {
      console.log("aaaa");
      $.ajax({
	      method: "POST", // метод HTTP, используемый для запроса
	      url: "https://you-scribe.ru/api/v1/auth", // строка, содержащая URL адрес, на который отправляется запрос
        contentType: "application/json",
        dataType: 'json',
	      data: JSON.stringify({ // данные, которые будут отправлены на сервер
	        number: "+79139726630"
	      }),
	      statusCode: {
	        200: function (res) { // выполнить функцию если код ответа HTTP 200
	          if (res.success) {
              sessionID = res.sessionid;

            }
	        }
	      }
	    })
    });



});
