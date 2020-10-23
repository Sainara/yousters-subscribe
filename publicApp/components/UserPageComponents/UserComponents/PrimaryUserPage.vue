<template>
  <profile-page v-bind:user='user'></profile-page>
</template>

<script>
import ProfilePage from './SubUserComponents/ProfilePage.vue';

export default {
  data:function () {
    return {};
  },
  props: {
    user: Object,
  },
  computed: {
    // isDontNeedToSendData: function () {
    //   return this.user.is_on_validation || this.user.isvalidated
    // }
  },
  mounted: function () {
    //console.log(this.user);
  },
  components: {
    ProfilePage,
  }
};
</script>
