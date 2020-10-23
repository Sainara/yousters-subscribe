<template>
  <main>
    <h1 style="margin-bottom:65px">Yousters Subscribe</h1>
    <template v-if="isSelectingType">
      <a href="" v-on:click.prevent="toPhiz()"class="main-button button-with-minwidth" style="margin-bottom:15px">Физ. лицо</a>
      <a href="" v-on:click.prevent="toNonPhiz()" class="main-button button-with-minwidth" style="margin-bottom:65px" >ИП или Юр. лицо</a>
      <a href="" v-on:click.prevent="logOut()" class="main-button button-with-minwidth">Выйти</a>
    </template>
    <phiz-validation v-else-if="isOnPhizPage">

    </phiz-validation>
    <non-phiz-validation v-else-if="isOnNonPhizPage">

    </non-phiz-validation>
  </main>
</template>

<script>
import PhizValidation from './ValidationComponents/PhizValidation.vue';
import NonPhizValidation from './ValidationComponents/NonPhizValidation.vue';


export default {
  props: {
    //user: Object,
  },
  data: function () {
    return {
      isOnPhizPage: false,
      isOnNonPhizPage:false
    };
  },
  computed: {
    isSelectingType: function () {
      return !this.isOnPhizPage && !this.isOnNonPhizPage
    }

  },
  methods: {
    logOut: function () {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.replace("/sign");
    },
    toPhiz: function () {
      this.isOnPhizPage = true
    },
    toNonPhiz: function () {
      this.isOnNonPhizPage = true
    },
    // yourCallBackFunction () {
    //   this.isOnNonPhizPage = false
    //   this.isOnPhizPage = false
    // }
  },
  mounted: function () {
    //console.log(this.user);
    //document.addEventListener("backbutton", this.yourCallBackFunction, false);
  },
  components: {
    PhizValidation,
    NonPhizValidation
  }
};
</script>
