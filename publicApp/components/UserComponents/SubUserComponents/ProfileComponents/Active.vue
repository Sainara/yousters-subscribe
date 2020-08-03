<template>
  <div>
    <h1>{{user.user_name}}</h1>
    <div class="block">
      <p class="subtitle">ИНН</p>
      <p class="smalltitle">{{user.inn}}</p>
    </div>
    <div class="block">
      <p class="subtitle">Email</p>
      <p class="smalltitle">{{user.email}}</p>
    </div>
    <div class="block">
      <div class="uk-card uk-card-small uk-card-secondary uk-card-body">
              <h3 class="uk-card-title">Secondary</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      </div>
    </div>
    <common-path></common-path>
  </div>
</template>

<script>

import CommonPath from './CommonPath.vue';

export default {
  props: {
    user: Object,
  },
  methods: {

  },
  mounted: function () {
    console.log(this.user);
  },
  components: {
    CommonPath
  }
};
</script>
