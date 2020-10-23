<template>
  <error-page v-if="nonAuth" message='У вас нет доступа'></error-page>
  <loading-page v-else-if="isLoading"></loading-page>
  <h5>{{user.phone}}</h5>
  <!-- <primary-user-page v-else-if="!isLoading" v-bind:user='user'></primary-user-page> -->
</template>

<script>
import ErrorPage from './SubComponents/ErrorPage.vue';
import LoadingPage from './SubComponents/LoadingPage.vue';
// import PrimaryUserPage from './UserComponents/PrimaryUserPage.vue';

export default {
  data: function() {
    return {
      nonAuth: false,
      isLoading: true,
      token: '',
      user: {},
    };
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
    getUser: function () {
      let self = this;
      this.axios.post('melawyer')
        .then(function (response) {
        if (response.data.success) {
          self.user = response.data.data;
          self.isLoading = false;
          //console.log(response.data.data);
        }
      });
    }
  },
  mounted: function () {
    this.token = this.getCookie('lawyer-token');
    if (!this.token) {
      this.nonAuth = true;
    } else {
      this.axios.defaults.headers['token'] = this.token;
      this.getUser();
      //console.log(this.token);
    }
  },
  components: {
    ErrorPage,
    LoadingPage,
    // PrimaryUserPage
  }
};
</script>
