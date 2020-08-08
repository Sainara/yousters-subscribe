<template>
  <table class="uk-table uk-table-hover">
    <tbody>
        <tr v-for="agreement in agreements" :key="agreements.id">
          <a class="agreement-cell-a" :href="getAgreementLink(agreement.uid)" style="display: block;">
            <td class="agreement-cell">
              <h3>{{agreement.title}}</h3>
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
      return "/case/" + uid
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
