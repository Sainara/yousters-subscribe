<template>
  <div>
    <h1>{{user.user_name}}</h1>
    <div class="block">
      <p class="subtitle">Email</p>
      <p class="smalltitle">{{user.email}}</p>
    </div>
    <div class="block">
      <p class="subtitle">Привязанная карта</p>
      <span v-if="isLoadingCardsData" class="uk-margin-small-right" uk-spinner="ratio: 2"></span>
      <a v-else-if="isNeedAddCard" href="" style="display:inline-block" class="main-button secondary-color-but">Привязать</a>
      <div v-else-if="card" class="lawyer_card">
        <p>{{card.Pan}}</p>
        <p>{{card.ExpDate}}</p>
      </div>
    </div>
    <div style="margin-top: 20px">
      <common-path></common-path>
    </div>
  </div>
</template>

<script>

import CommonPath from './CommonPath.vue';

export default {
  data: function () {
    return {
      isLoadingCardsData: false,
      isNeedAddCard: false,
      card: {
        Pan: "518223******0036",
        ExpDate: "11/22"
      }
    };
  },
  props: {
    user: Object,
  },
  methods: {

  },
  computed: {

  },
  mounted: function () {

  },
  components: {
    CommonPath
  }
};
</script>
