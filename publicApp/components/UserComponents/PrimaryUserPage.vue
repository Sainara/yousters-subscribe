<template>
  <profile-page v-if="isNeedToSendData" v-bind:user='user'></profile-page>
</template>

<script>
import ProfilePage from './SubUserComponents/ProfilePage.vue';

export default {
  props: {
    user: Object,
  },
  methods: {
    isNeedToSendData: function () {
      return !(this.user.is_on_validation || this.user.isvalidated)
    }
  },
  mounted: function () {
    console.log(this.user);
  },
  components: {
    ProfilePage
  }
};
</script>
