<template lang="html">
  <error-page v-if="nonAuth" message='У вас нет доступа'></error-page>
  <div v-else class="uk-card uk-card-default uk-border-rounded uk-margin-large-top">

      <div class="uk-card-body uk-padding-small">

        <div v-for="message in messages" v-bind:class="[ message.creator_id == sender ? 'me uk-grid-small uk-flex-bottom uk-flex-right uk-text-right' : 'guest uk-grid-small uk-flex-bottom uk-flex-left' ]" uk-grid>

          <div class="uk-width-2-3">
            <div v-bind:class="[ message.creator_id == sender ? 'uk-card uk-card-body uk-card-small uk-card-primary uk-border-rounded' : 'uk-card uk-card-body uk-card-small uk-card-default uk-border-rounded' ]">
              <p class="uk-margin-remove">{{message.m_content}}</p>
            </div>
          </div>
        </div>

        <div class="guest uk-grid-small uk-flex-bottom uk-flex-left" uk-grid>

          <div class="uk-width-2-3">
            <div class="uk-card uk-card-body uk-card-small uk-card-default uk-border-rounded">
              <p class="uk-margin-remove">
                <span class="etc"><i></i><i></i><i></i></span>
              </p>
            </div>
          </div>
        </div>

      </div>

      <div class="uk-card-footer uk-padding-remove">
        <div class="uk-grid-small uk-flex-middle" uk-grid>
          <div class="uk-width-auto">
            <a href="#" class="uk-icon-link uk-margin-small-left" uk-icon="icon: happy"></a>
          </div>
          <div class="uk-width-expand">
            <div class="uk-padding-small uk-padding-remove-horizontal">
              <textarea class="uk-textarea uk-padding-remove uk-border-remove" rows="1" placeholder="Escreva a mensagem..."></textarea>
            </div>
          </div>
          <div class="uk-width-auto">
            <ul class="uk-iconnav uk-margin-small-right">
              <li>
                <a href="#" uk-icon="icon: image"></a>
              </li>
              <li>
                <a href="#" uk-icon="icon: location"></a>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
</template>

<script>

import ErrorPage from './../SubComponents/ErrorPage.vue';

export default {

  props: {
    user: Object
  },
  data: function () {
    return {
      socket: null,
      nonAuth: true,
      token: null,
      messages: [],
      sender: null
    }
  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    parseJWT: function (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }
  },
  mounted: function () {
    this.token = this.getCookie('lawyer-token');
    console.log(this.$route);
    if (this.token) {
      this.nonAuth = false;
      this.socket = new WebSocket("wss://you-scribe.ru/api/v1/dialog/"+ this.$route.params.uid + "?token=" + this.token);

      this.sender = this.parseJWT(this.token)['id'];

      this.socket.onopen = function() {
        alert("Соединение установлено.");
      };

      this.socket.onclose = function(event) {
        if (event.wasClean) {
          alert('Соединение закрыто чисто');
        } else {
          alert('Обрыв соединения'); // например, "убит" процесс сервера
        }
        //alert('Код: ' + event.code + ' причина: ' + event.reason);
      };
      var self = this;
      this.socket.onmessage = function(event) {
        //alert("Получены данные " + event.data);
        var json = JSON.parse(event.data);
        switch (json["type"]) {
          case "message":
            self.messages = json["data"];
            break;
          case "offer":

            break;
          default:
            break;
        }
      };

      this.socket.onerror = function(error) {
        //alert("Ошибка " + error.message);
      };
    }
  },
  components: {
    ErrorPage
  }
}
</script>

<style lang="css" scoped>
.uk-card-small {
  &.uk-card-body {
    padding: 5px 8px;
    font-size: 13px;
  }
}

.uk-border-remove {
  border: 0 none;
}

textarea {
  background: none !important;
  resize: none;
}

@keyframes dot-anim {
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(0, -6px);
  }
  0% {
    transform: translate(0, 0);
  }
}
%etc-pattern {
  width: 6px;
  height: 6px;
  background: #222;
  border-radius: 100%;
  display: inline-block;
  animation: dot-anim 1s infinite linear;
  transform: translate(0, 0);
}

.etc {
  display: block;
  position: relative;
  i {
    @extend %etc-pattern;
    & + i {
      margin-left: 3px;
    }
    &:nth-child(1) {
      animation-delay: .5s;
    }
    &:nth-child(2) {
      animation-delay: .4s;
    }
    &:nth-child(3) {
      animation-delay: .3s;
    }
  }
}

.uk-card {
  position: relative;
  z-index: 1;
}

.guest .uk-card:after, .me .uk-card:after {
  width: 10px;
  height: 45px;
  position: absolute;
  bottom: 0;
}
.guest .uk-card:after {
  background: #fff;
  left: -4px;
  clip-path: polygon(100% 70%, 0% 100%, 100% 100%);
}
.me .uk-card:after {
  background: #1e87f0;
  right: -4px;
  clip-path: polygon(0 70%, 0% 100%, 100% 100%);
}
</style>
