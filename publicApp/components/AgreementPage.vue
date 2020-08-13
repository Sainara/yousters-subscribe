<template>
  <error-page v-if="nonAuth" message='У вас нет доступа'></error-page>
  <loading-page v-else-if="isLoading"></loading-page>
  <div v-else-if="!isLoading" class="uk-container uk-container-xsmall" style="margin-bottom: 50px">
    <div class="uk-grid-small" uk-grid>
      <div>
        <h2 class="agr_title">{{agreement.title}}</h2>
        <div class="block">
          <p class="subtitle">Статус</p>
          <p class="title">{{getAgreementStatusString(agreement.status_id)}}</p>
        </div>
        <div class="block">
          <p class="subtitle">Дата создания</p>
          <p class="title">{{getFormatedTime(agreement.created_at)}}</p>
        </div>
        <div class="block">
          <p class="subtitle">Ссылка на файл</p>
          <p class="smalltitle"><a href="<%= agreement.link %>">{{agreement.link}}</a></p>
        </div>
        <div class="block">
          <p class="subtitle">Хэш (SHA256) файла</p>
          <p class="emoji-hash">{{agreement.hash}}</p>
        </div>
        <div v-if="user.is_on_validation" class="block">
          <p class="subtitle">Примечание</p>
          <p class="smalltitle">{{ validateMessage() }}</p>
        </div>
        <div v-if="subscribtions.length > 0" class="block">
          <p class="subtitle">Подписали</p>
          <p v-for="subscribtion in subscribtions" :key="subscribtion.user_name" class="title">
            {{getFormatedSub(subscribtion)}}
          </p></br>
        </div>
        <div class="block">
          <template v-if="agreement.status_id == 1">
            <div v-if="isGettingPaketData">
              <a href="#" class="main-button case-sub-button">Загрузка...</a>
            </div>
            <div v-else>
              <a v-if="isHavePaket" href="#" v-on:click.prevent="usePaket" class="main-button case-sub-button">Использовать пакет</a>
              <a v-else href="#" v-on:click.prevent="payAgr" class="main-button case-sub-button">Оплатить</a>
            </div>
          </template>
          <template v-if="canBeSubscribed">
            <transition name="fade">
              <input v-if="isEnteringCode" maxlength="6" v-model="code" class="uk-input uk-form-large" type="number" name="code" placeholder="Код">
            </transition>
            <a href="#" v-on:click.prevent="subscribe" class="main-button case-sub-button">Подписать</a>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import ErrorPage from './SubComponents/ErrorPage.vue';
import LoadingPage from './SubComponents/LoadingPage.vue';
import moment from 'moment';

export default {
  props: {
    user: {
      type:Object,
      default: function () {
          return {
            user_name: '',
            is_on_validation:false,
            isvalidated: false
          };
      }
    },
  },
  data: function () {
    return {
      isGettingPaketData: false,
      isHavePaket: false,
      nonAuth: false,
      isLoading: true,
      agreement: {},
      subscribtions: [],
      token: '',
      canBeSubscribed: false,
      isEnteringCode:false,
      code: '',
      sessionID: ''
    }
  },
  computed: {

  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    subscribe: function () {
      let self = this;
      if (!this.isEnteringCode) {
        this.isEnteringCode = true;
        this.axios.post('initsubscribe', {uid: this.agreement.uid})
          .then(function (response) {
          if (response.data.success) {
            self.sessionID = response.data.sessionid;
          }
        });
      } else {
        this.axios.post('validatesubscribe', {sessionid: this.sessionID, code: this.code})
          .then(function (response) {
          if (response.data.success) {
            self.getAgreement();
            //self.$router.go()
          }
        });
      }
    },
    canBeSubscribedFunc:function () {
      if (this.agreement.status_id == 5 || this.agreement.status_id == 7) {
        if (this.user.isvalidated) {
          if (this.subscribtions.length == 0) {
            this.canBeSubscribed = true;
          } else if (this.subscribtions.length == 1) {
            if (this.subscribtions[0].user_name != this.user.user_name) {
              this.canBeSubscribed = true;
            } else {
              this.canBeSubscribed = false;
            }
          } else {
            this.canBeSubscribed = false
          }
        }
      }
    },
    usePaket: function () {
      let self = this;
      this.axios.post('pakets/use', {agr_uid: this.agreement.uid})
        .then(function (response) {
        if (response.data.success) {
          self.getAgreement();
          //self.$router.go()
        }
      });
    },
    payAgr: function () {
      this.axios.post('payment', {
        type: "agreement",
        agr_uid: this.agreement.uid
      }).then(function (response) {
        if (response.data.success) {
          var link = "/api/v1/checkout/" + response.data.uid + "?source=web";
          window.open(link,'_self');
        }
      });
    },
    validateMessage: function () {
      if (this.agreement.status_id == 1) {
        return "Вы можете оплатить договор, но сможете подписать только после верификации вашего профиля";
      } else if (this.agreement.status_id == 5) {
        return "Вы сможете подписать только после верификации вашего профиля";
      }
      return "";
    },
    getFormatedTime: function (timestamptz) {
      return moment.utc(timestamptz).local().format("DD.MM.YYYY в HH:mm:ss")
    },
    getFormatedSub:function (sub) {
      if (sub.inn) {
        return sub.user_name + ' (ИНН: ' + s.inn + ') '+ this.getFormatedTime(sub.created_at) +' при помощи кода, отправленного на номер телефона ' + sub.phone
      } else {
        return sub.user_name + ' - '+ this.getFormatedTime(sub.created_at) +' при помощи кода, отправленного на номер телефона ' + sub.phone
      }
    },
    getPaketsData: function () {
      let self = this;
      this.isGettingPaketData = true;
      this.axios.get('pakets/my')
        .then(function (response) {
        if (response.data.success) {
          self.isGettingPaketData = false;

          if (response.data.data.packets == []) {
            self.isHavePaket = false;
          } else {
            var all = 0;
            for (var i = 0; i < response.data.data.packets.length; i++) {
              all += response.data.data.packets[i].howmuch;
            }
            self.isHavePaket = all > response.data.data.usage;
          }
        }
      });
    },
    getAgreement:function () {
      let self = this;
      this.axios.get('getagreement/' + this.$route.params.uid + '?emoji=true')
        .then(function (response) {
        if (response.data.success) {
          self.agreement = response.data.data;
          self.isLoading = false;
          self.canBeSubscribedFunc();
          if (self.agreement.status_id == 1) {
            self.getPaketsData()
          }
          if (self.agreement.status_id > 5) {
            self.getSubscribtions()
          }
        }
      });
    },
    getUser: function () {
      let self = this;
      this.axios.post('me')
        .then(function (response) {
        if (response.data.success) {
          self.user = response.data.data;
          self.canBeSubscribedFunc();
        }
      });
    },
    getSubscribtions:function () {
      let self = this;
      this.axios.post('getagreementssubs', {uid: this.$route.params.uid})
        .then(function (response) {
        if (response.data.success) {
          self.subscribtions = response.data.data;
          self.canBeSubscribedFunc();
        }
      });
    },
    getAgreementStatusString: function (id) {
      switch (id) {
        case 10:
          return "Активен";
          break;
        case 7:
          return "Ожидает подписания контрагентом";
          break;
        case 5:
          return "Оплачен";
          break;
        case 1:
          return "Создан";
          break;
        default:
          return "Неизвестно"
          break;
      }
    }
  },
  mounted: function () {
    this.token = this.getCookie('token');
    if (!this.token) {
      window.location.replace('/case/' + this.$route.params.uid);
    } else {
      this.axios.defaults.headers['token'] = this.token;
      this.getAgreement();
      if (!this.user.user_name) {
        this.getUser();
      }
      //console.log(this.token);
    }
  },
  components: {
    ErrorPage,
    LoadingPage
  }
}
</script>
