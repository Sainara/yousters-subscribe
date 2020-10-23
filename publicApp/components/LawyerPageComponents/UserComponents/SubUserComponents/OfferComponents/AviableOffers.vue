<template>
  <table class="uk-table uk-table-hover">
    <tbody>
        <tr v-for="agreement in avOffers" :key="avOffers.id">
          <a class="agreement-cell-a" href="#" v-on:click.prevent="getAgreementLink(agreement.uid)" style="display: block;">
            <td class="agreement-cell">
              <h4>{{agreement.title}}</h4>
              <!-- <p class="agr-status">{{getAgreementStatusString(agreement.status_id)}}</p> -->
            </td>
          </a>
        </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    acOffers: Array,
    avOffers: Array,
  },
  data: function () {
    return {
      //user: this.user,
    }
  },
  methods: {

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
