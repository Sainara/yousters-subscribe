<template>
  <table class="uk-table uk-table-hover">
    <tbody>
        <tr v-for="agreement in agreements" :key="agreements.id">
          <a class="agreement-cell-a" href="#" v-on:click.prevent="getAgreementLink(agreement.uid)" style="display: block;">
            <td class="agreement-cell">
              <h4>{{agreement.title}}</h4>
              <p class="agr-status">{{getAgreementStatusString(agreement.status_id)}}</p>
            </td>
          </a>
        </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    agreements: Array,
    user: Object,
  },
  data: function () {
    return {
      //user: this.user,
    }
  },
  methods: {
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
    },
    getAgreementLink: function (uid) {
      //this.$router.push("/agreement/" + uid)
      this.$router.push({ name: 'agreementPage' , params: {uid: uid, user: this.user}}) // -> /user/123

    }
  },
  computed: {

  },
  mounted: function () {
    //console.log(this.user);
  },
  components: {

  }
};
</script>
