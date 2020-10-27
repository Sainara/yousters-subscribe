<template>
  <table class="uk-table uk-table-hover">
    <tbody>
        <tr v-for="agreement in activeOffers" :key="activeOffers.uid">
          <a class="agreement-cell-a" href="#" v-on:click.prevent="getDialogLink(agreement.uid)" style="display: block;">
            <td class="agreement-cell">
              <h2 style="margin-bottom: 10px">{{agreement.title}}</h2>
              <p class="smalltitle">Создано: {{getFormatedTime(agreement.created_at)}}</p>
            </td>
          </a>
        </tr>
    </tbody>
  </table>
</template>

<script>

import moment from 'moment';

export default {
  props: {
    user: Object,
  },
  data: function () {
    return {
      activeOffers: []
      //user: this.user,
    }
  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    getDialogLink: function (uid) {
      //this.$router.push("/agreement/" + uid)
      console.log(uid);
      this.$router.push({ name: 'dialogPage', params: {uid: uid}}) // -> /user/123
    },
    getFormatedTime: function (timestamptz) {
      return moment.utc(timestamptz).local().format("DD.MM.YYYY в HH:mm:ss")
    },
    getActiveOffers: function () {
      let self = this;
      this.axios.get('offer/active/lawyer')
        .then(function (response) {
        if (response.data.success) {
          self.activeOffers = response.data.data;
        }
      });
    },
  },
  computed: {

  },
  mounted: function () {
    this.axios.defaults.headers['token'] = this.getCookie('lawyer-token');
    this.getActiveOffers();
    //console.log(this.user);
  },
  components: {

  }
};
</script>
