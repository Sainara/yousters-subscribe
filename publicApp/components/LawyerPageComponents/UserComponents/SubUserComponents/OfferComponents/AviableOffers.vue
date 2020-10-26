<template>
  <table class="uk-table uk-table-hover">
    <tbody>
        <tr v-for="agreement in avoffers" :key="avoffers.id">
          <a class="agreement-cell-a" href="#" v-on:click.prevent="getDialogLink(agreement.uid)" style="display: block;">
            <td class="agreement-cell">
              <h4>{{agreement.title}}</h4>
            </td>
          </a>
        </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    user: Object,
    //acoffers: Array,
    avoffers: Array,
  },
  data: function () {
    return {
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
    getAllOffers: function () {
      let self = this;
      this.axios.get('offer/lawyer')
        .then(function (response) {
          console.log(response);
        if (response.data.success) {
          console.log(response.data.data);

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
