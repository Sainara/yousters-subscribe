$(document).ready(function () {
    "use strict";

    var sessionID = "";

    $('#api_submit').on('click', function() {
      console.log("aaaa");
      $.ajax({
	      method: "POST", // метод HTTP, используемый для запроса
	      url: "https://you-scribe.ru/api/v1/auth", // строка, содержащая URL адрес, на который отправляется запрос
        contentType: "application/json",
	      data: { // данные, которые будут отправлены на сервер
	        phone: "+79139726630"
	      },
	      success: function ( msg ) { // функции обратного вызова, которые вызываются если AJAX запрос выполнится успешно (если несколько функций, то необходимо помещать их в массив)
	        alert(msg) // добавляем текстовую информацию и данные возвращенные с сервера
	      },
	      statusCode: {
	        200: function () { // выполнить функцию если код ответа HTTP 200
	          console.log( "Ok" );
	        }
	      }
	    })
    });


});
