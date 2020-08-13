<template>
  <error-page v-if="nonAuth" message='У вас нет доступа'></error-page>
  <loading-page v-else-if="isLoading"></loading-page>
  <div v-else-if="!isLoading" class="uk-container uk-container-xsmall">
    <div class="uk-grid-small" uk-grid>
      <div>
        <h1 class="certificate">Сертификат онлайн-подписи</h1>
        <div class="block">
          <p class="subtitle">Что было подписано</p>
          <p class="title">{{agreement.title}}</p>
        </div>
        <div class="block">
          <p class="subtitle">Дата создания</p>
          <p class="title">{{agreement.created_at}}</p>
        </div>
        <div class="block">
          <p class="subtitle">Ссылка на файл</p>
          <p class="smalltitle"><a href="<%= agreement.link %>">{{agreement.link}}</a></p>
        </div>
        <div class="block">
          <p class="subtitle">Хэш (SHA256) файла</p>
          <p class="emoji-hash">{{agreement.hash}}</p>
        </div>
        <div class="block">
          <% if (subs.length > 0) { %>
            <p class="subtitle">Подписали</p>
          <% }; %>
          <% subs.forEach(function(s) { %>
            <p class="smalltitle"><%= s.user_name %> (ИНН: <%= s.inn %>) <%= moment.utc(s.created_at).local().format("DD.MM.YYYY в HH:mm:ss")  %> при помощи кода, отправленного на номер телефона <%= s.phone %></p></br>
          <% }); %>
          <% if (subs.length < 2) { %>
            <a href="https://apps.apple.com/us/app/id1517313227" class="main-button case-sub-button">Подписать в приложении</a>
          <% }; %>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import ErrorPage from './SubComponents/ErrorPage.vue';
import LoadingPage from './SubComponents/LoadingPage.vue';

export default {
  data: function () {
    return {
      nonAuth: false,
      isLoading: true,
      agreement: {},
      token: ''
    }
  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    getAgreement:function () {
      let self = this;
      this.axios.get('getagreement/' + this.$route.params.uid)
        .then(function (response) {
        if (response.data.success) {
          self.agreement = response.data.data;
          self.isLoading = false;
          //console.log(response.data.data);
        }
      });
    }
  },
  mounted: function () {
    this.token = this.getCookie('token');
    if (!this.token) {
      this.nonAuth = true;
    } else {
      this.axios.defaults.headers['token'] = this.token;
      this.getAgreement();
      //console.log(this.token);
    }
  },
  components: {
    ErrorPage,
    LoadingPage
  }
}
</script>
