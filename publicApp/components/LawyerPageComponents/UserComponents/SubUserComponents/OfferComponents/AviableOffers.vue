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
    getDialogLink: function (uid) {
      //this.$router.push("/agreement/" + uid)
      console.log(uid);
      this.$router.push({ name: 'dialogPage', params: {uid: uid}}) // -> /user/123
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
