<template>
  <div>
    <h1><slot></slot></h1>
    <p class="subtitle" style="margin-bottom: 30px">Вы можете пройти верификацию, чтобы иметь возможность подписывать договоры</p>
    <router-link class="main-button full-width-but" style="margin-bottom: 30px" to="/validate">Пройти верификацию</router-link>
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
    }
  },
  methods: {

  },
  mounted: function () {
    //console.log(this.user);
  },
  components: {
    CommonPath
  }
};

</script>
