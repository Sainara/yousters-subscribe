<template>
  <div>
    <h1>{{user.user_name}}</h1>
    <div class="block">
      <p class="subtitle">Email</p>
      <p class="smalltitle">{{user.email}}</p>
    </div>
    <common-path></common-path>
  </div>
</template>

<script>

import CommonPath from './CommonPath.vue';

export default {
  data: function () {
    return {
    
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
