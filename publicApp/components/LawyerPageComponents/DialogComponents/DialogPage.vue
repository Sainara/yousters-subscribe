<template lang="html">
  <error-page v-if="nonAuth" message='У вас нет доступа'></error-page>
  <div v-else>
    <div class="uk-card uk-card-default uk-border-rounded uk-margin-large-top" style="margin-top: 0px !important;">
      <div class="uk-card-body uk-padding-small" v-bind:class='[isMobile ? "mobile_padding_from_inp" : "desc_padding_from_inp"]'>

        <div v-for="message in messages" v-bind:class="[ message.creator_id == sender ? 'me uk-grid-small uk-flex-bottom uk-flex-right uk-text-right' : 'guest uk-grid-small uk-flex-bottom uk-flex-left' ]" uk-grid>

          <div class="uk-width-2-3">
            <div style="padding: 0" v-bind:class="[ message.creator_id == sender ? 'uk-card uk-card-body uk-card-small uk-card-secondary uk-border-rounded' : 'uk-card uk-card-body uk-card-small uk-card-default uk-border-rounded' ]">
              <p style="padding: 10px" v-if="message.m_type == 'text'" class="uk-margin-remove">{{message.m_content}}</p>
              <audio v-if="message.m_type == 'voice'" controls style="width: -webkit-fill-available;">
                <source v-bind:src="message.m_content" type="audio/x-m4a">
                  Тег audio не поддерживается вашим браузером.
                </audio>
                <div v-if="message.m_type == 'image'" uk-lightbox="animation: slide">
                  <a :href="message.m_content">
                    <img :src="message.m_content" :alt="message.m_content">
                  </a>
                </div>

              </div>
            </div>
          </div>

        <!-- <div class="guest uk-grid-small uk-flex-bottom uk-flex-left" uk-grid>

          <div class="uk-width-2-3">
            <div class="uk-card uk-card-body uk-card-small uk-card-default uk-border-rounded">
              <p class="uk-margin-remove">
                <span class="etc"><i></i><i></i><i></i></span>
              </p>
            </div>
          </div>
        </div> -->

      </div>
      <offer-view v-if="offer" v-bind:offer="offer"></offer-view>
      <offer-create v-else-if="dialog.dialog_status == 'created'"></offer-create>
      <messaging v-else></messaging>

    </div>
  </div>
</template>

<script>

import ErrorPage from './../SubComponents/ErrorPage.vue';
import OfferCreate from './DialogSubComponents/OfferCreate.vue';
import OfferView from './DialogSubComponents/OfferView.vue';
import Messaging from './DialogSubComponents/Messaging.vue';

export default {

  props: {
    user: Object
  },
  data: function () {
    return {
      socket: null,
      nonAuth: false,
      token: null,
      messages: [],
      sender: null,
      dialog: null,
      offer: null
    }
  },
  methods: {
    isMobile: function () {
      return screen.width <= 960;
    },
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
    },
    getAllOffers: function () {
      let self = this;
      this.axios.get('offer/lawyer')
        .then(function (response) {
        if (response.data.success) {
          for (var i = 0; i < response.data.data.length; i++) {
            if (response.data.data[i].dialog_uid == self.$route.params.uid) {
              self.offer = response.data.data[i];
            }
          }
        }
      });
    },
    getDialogs: function () {
      let self = this;
      this.axios.get('dialog/lawyer')
        .then(function (response) {
          // console.log(response);
        if (response.data.success) {
          for (var i = 0; i < response.data.data.length; i++) {
            if (response.data.data[i].uid == self.$route.params.uid) {
              self.dialog = response.data.data[i];
            }
          }
        }
      });
    }
  },
  mounted: function () {
    this.token = this.getCookie('lawyer-token');
    //console.log(this.$route);
    if (this.token) {
      this.axios.defaults.headers['token'] = this.token;
      this.getDialogs();
      this.getAllOffers();
      this.socket = new WebSocket("wss://you-scribe.ru/api/v1/dialog/"+ this.$route.params.uid + "?token=" + this.token);

      this.sender = this.parseJWT(this.token)['id'];

      this.socket.onopen = function() {
        console.log("Соединение установлено.");
      };
      var self = this;
      this.socket.onclose = function(event) {
        if (event.wasClean) {
          console.log('Соединение закрыто чисто');
        } else {
          console.log('Обрыв соединения'); // например, "убит" процесс сервера
          console.log(event);
          self.socket = new WebSocket("wss://you-scribe.ru/api/v1/dialog/"+ self.$route.params.uid + "?token=" + self.token);
        }
        //alert('Код: ' + event.code + ' причина: ' + event.reason);
      };

      this.socket.onmessage = function(event) {
        //alert("Получены данные " + event.data);
        var json = JSON.parse(event.data);
        switch (json["type"]) {
          case "message":
            for (var i = 0; i < json["data"].length; i++) {
              var isContain = false;
              for (var g = 0; g < self.messages.length; g++) {
                if (self.messages[g].id == json["data"][i].id) {
                  isContain = true
                }
                self.messages[g]
              }
              if (!isContain) {
                self.messages.push(json["data"][i]);
              }
            }

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
    } else {
      this.nonAuth = true;
    }
  },
  components: {
    ErrorPage,
    OfferCreate,
    Messaging,
    OfferView
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


</style>
