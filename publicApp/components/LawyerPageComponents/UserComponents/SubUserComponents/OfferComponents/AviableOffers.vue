<template>
  <table class="uk-table uk-table-hover">
    <tbody>
        <tr v-for="agreement in avoffers" :key="avoffers.uid">
          <a class="agreement-cell-a" href="#" v-on:click.prevent="getDialogLink(agreement.uid)" style="display: block;">
            <td class="agreement-cell">
              <h3>{{agreement.title}} <span class="smalltitle" v-if="agreement.isHaveAlreadySentOffer">Предложение уже отправлено</span></h3>
              <p class="smalltitle">{{getFormatedTime(agreement.created_at)}}</p>
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
    //acoffers: Array,
    avoffers: Array,
  },
  data: function () {
    return {
      alloffers: []
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
    getAllOffers: function () {
      let self = this;
      this.axios.get('offer/lawyer')
        .then(function (response) {
        if (response.data.success) {
          self.alloffers = response.data.data;
          for (var i = 0; i < self.avoffers.length; i++) {
            for (var g = 0; g < self.alloffers.length; g++) {
              if (self.alloffers[g].dialog_uid == self.avoffers[i].uid) {
                self.avoffers[i].isHaveAlreadySentOffer = true;
              }
            }
          }
          self.$forceUpdate();
        }
      });
    },
  },
  computed: {

  },
  mounted: function () {
    this.axios.defaults.headers['token'] = this.getCookie('lawyer-token');
    this.getAllOffers();
    //console.log(this.user);
  },
  components: {

  }
};
</script>
