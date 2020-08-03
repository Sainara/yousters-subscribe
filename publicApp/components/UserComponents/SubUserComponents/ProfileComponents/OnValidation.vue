<template>
  <div>
    <h1><slot></slot></h1>
    <p class="subtitle" style="margin-bottom: 30px">Ваш профиль находится на верификации. Вам придёт оповещение, когда мы закончим</p>
    <common-path></common-path>
  </div>
</template>

<script>
import CommonPath from './CommonPath.vue';

export default {
  props: {
    user: Object,
  },
  data: function () {
    return {
      user: this.user,
    }
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
