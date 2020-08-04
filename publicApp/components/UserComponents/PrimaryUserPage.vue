<template>
  <profile-page v-if="isDontNeedToSendData" v-bind:user='user'></profile-page>
  <validation-page v-else></validation-page>
</template>

<script>
import ProfilePage from './SubUserComponents/ProfilePage.vue';
import ValidationPage from './SubUserComponents/ValidationPage.vue';

export default {
  props: {
    user: Object,
  },
  computed: {
    isDontNeedToSendData: function () {
      return this.user.is_on_validation || this.user.isvalidated
    }
  },
  mounted: function () {
    console.log(this.user);
  },
  components: {
    ProfilePage,
    ValidationPage
  }
};
</script>
