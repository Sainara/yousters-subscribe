<template>
  <div class="common-buttons">
    <a href="/legal/faq" class="main-button secondary-color-but full-width-but">FAQ</a>
    <a href="mailto:support@you-scribe.ru" class="main-button secondary-color-but full-width-but" style="margin-bottom: 40px">Служба поддержки</a>

    <a href="/legal/user-agreement" class="main-button secondary-color-but full-width-but with-out-bg">Лицензионное соглашение</a>
    <a href="/legal/termsofuse" class="main-button secondary-color-but full-width-but with-out-bg">Условия использования</a>
    <a href="/legal/confidential" class="main-button secondary-color-but full-width-but with-out-bg">Политика конфиденциальности</a>

    <a href="" v-on:click.prevent="logOut()" class="main-button full-width-but">Выйти</a>
  </div>
</template>

<script>
export default {
  methods: {
    logOut: function () {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      window.location.replace("/sign");
    }
  }
};
</script>
