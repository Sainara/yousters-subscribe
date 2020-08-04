$(document).ready(function () {
    "use strict";

    var sessionID = "";
    var isEnteringCode = false;

    const getCookie = (name) => {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    if (getCookie('token')) {
      window.location.replace("/general");
    }

    $(".phone_mask").mask("+7(999)999-99-99",{placeholder:"_"});

    $('#api_submit').on('click', function(e) {
      e.preventDefault();
      if (isEnteringCode) {
        if (!checkCode()) {
          UIkit.notification({message: 'Введите код', status: 'danger'})
          return
        };
        $.ajax({
  	      method: "POST", // метод HTTP, используемый для запроса
  	      url: "https://you-scribe.ru/api/v1/validate", // строка, содержащая URL адрес, на который отправляется запрос
          contentType: "application/json",
          dataType: 'json',
  	      data: JSON.stringify({ // данные, которые будут отправлены на сервер
  	        sessionid: sessionID,
            code: $("#codeField")[0].value
  	      }),
  	      statusCode: {
  	        200: function (res) { // выполнить функцию если код ответа HTTP 200
  	          if (res.success) {
                console.log(res.token);
                // add secure;
                document.cookie = "token=" + res.token + "; max-age=3600; samesite=lax";
                window.location.replace("/general");
              }
  	        }
  	      }
  	    })
      } else {
        if (!checkPhone()) {
          UIkit.notification({message: 'Введите номер телефона', status: 'danger'})
          return
        };
        $.ajax({
  	      method: "POST", // метод HTTP, используемый для запроса
  	      url: "https://you-scribe.ru/api/v1/auth", // строка, содержащая URL адрес, на который отправляется запрос
          contentType: "application/json",
          dataType: 'json',
  	      data: JSON.stringify({ // данные, которые будут отправлены на сервер
  	        number: $("#phoneField")[0].value
  	      }),
  	      statusCode: {
  	        200: function (res) { // выполнить функцию если код ответа HTTP 200
  	          if (res.success) {
                sessionID = res.sessionid;
                isEnteringCode = true;
                makeEnterCode();
              }
  	        }
  	      }
  	    })
      }
    });



    const checkPhone = () => {
      return $("#phoneField")[0].value != "";
    }

    const checkCode = () => {
      return $("#codeField")[0].value.length == 6;
    }

    const makeEnterCode = () => {

      UIkit.notification({message: 'Вам отправлен СМС с кодом', status: 'success'})
      $("#phoneField").attr("hidden",true)
      $("#codeField").attr("hidden",false)
    }


});
