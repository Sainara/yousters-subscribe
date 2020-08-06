<template>
  <div>
    <h1>{{user.user_name}}</h1>
    <div v-if="!user.isPhiz" class="block">
      <p class="subtitle">ИНН</p>
      <p class="smalltitle">{{user.inn}}</p>
    </div>
    <div class="block">
      <p class="subtitle">Email</p>
      <p class="smalltitle">{{user.email}}</p>
    </div>
    <div class="block">
      <div class="uk-card uk-card-small uk-card-secondary uk-card-body">
          <p class="title">Расход пакетов <span>{{usagement}}</span></p>
      </div>
      <div class="pakets-wrapper">
        <div class="paket-wrapper" v-for="item in pakets" :key="item.id">
          <h4>{{item.title.split(' ')[0]}} <span>{{item.price.split('.')[0]}}Р</span></h4>
          <p class="description">{{item.description.split(',').join('\n')}}</p>
          <a class="main-button full-width-but" href="" v-on:click.prevent="initPayment(item.iap_id)">Купить</a>
        </div>
      </div>
    </div>
    <common-path></common-path>
  </div>
</template>

<script>

import CommonPath from './CommonPath.vue';

export default {
  data: function () {
    return {
      used: '-',
      allHave: {},
      isloadingUsageInfo: true,
      pakets: []

    };
  },
  props: {
    user: Object,
  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    initPayment: function (id) {
      this.axios.post('payment', {
        type: "paket",
        paket_id: id
      }).then(function (response) {
        if (response.data.success) {
          var link = "/api/v1/checkout/" + response.data.uid;
          window.open(link,'_self');
        }
      });
    }
  },
  computed: {
    usagement: function () {
      if (this.isloadedUsageInfo) {
        return "-/-";
      } else {
        if (this.pakets == []) {
          return "Пусто";
        } else {
          var all = 0;
          for (var i = 0; i < this.allHave.length; i++) {
            all += this.allHave[i].howmuch;
          }
          return this.used + "/" + all;
        }
      }
    }
  },
  mounted: function () {
    this.axios.defaults.headers['token'] = this.getCookie('token');
    let self = this;
    this.axios.get('pakets')
      .then(function (response) {
      if (response.data.success) {
        self.pakets = response.data.data;
      }
    });
    this.axios.get('pakets/my')
      .then(function (response) {
      if (response.data.success) {
        self.isloadingUsageInfo = false;
        self.used = response.data.data.usage;
        self.allHave = response.data.data.packets;
      }
    });
  },
  components: {
    CommonPath
  }
};
</script>
