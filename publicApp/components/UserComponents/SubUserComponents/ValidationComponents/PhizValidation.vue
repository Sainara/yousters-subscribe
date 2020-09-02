<template>
  <div>
    <loading-page v-if="isLoading"></loading-page>

    <div v-else class="uk-container uk-container-xsmall">
      <div class="non-phiz-wrap">
        <input v-model="email" class="uk-input uk-form-width-medium uk-form-large" type="email" name="email" placeholder="Email">
      </div>
      <div style="margin: 0px 10px">
        <p style="margin: 20px 0px 7px" class="smalltitle">Страница паспорта с фотографией</p>
        <div uk-form-custom="target: true">
            <input type="file" accept="image/*" @change="handleMainPage($event)">
            <input class="uk-input uk-form-width-medium" type="text" placeholder="Выберите файл">
        </div>
        <p style="margin: 20px 2px 7px" class="smalltitle">Страница паспорта с регистрацией</p>
        <div uk-form-custom="target: true">
            <input type="file" accept="image/*" @change="handleSecondPage($event)">
            <input class="uk-input uk-form-width-medium" type="text" placeholder="Выберите файл">
        </div>
        <p style="margin: 20px 2px 7px" class="smalltitle">Запишите селфи-видео с паспортом в котором вы произносите ваш номер телефона. Должно быть видно вас и фото на паспорте</p>
        <div uk-form-custom="target: true">
            <input type="file" accept="video/*" @change="handleVideoPage($event)">
            <input class="uk-input uk-form-width-medium" type="text" placeholder="Выберите файл">
        </div>
      </div>
      <a style="margin-top: 70px" href="#" v-on:click.prevent="sendToValidate()" class="main-button full-width-but">Отправить</a>
    </div>
  </div>
</template>
<script>
// import Sberid from './sberid-sdk';
//
// const oidcParams = {
//   response_type: 'code',
//   client_type: 'PRIVATE',
//   client_id: 'a5a2d1b0-85d1-4caf-9bea-03cd21de3786',
//   redirect_uri: 'https://you-scribe.ru/oidc/success',
//   scope: 'openid+name',
//   state: 'NfZscgwxPY7v0kYvuPfnFHA57bqHxQc3lV51Oiaddd4',
//   nonce: 'NfZscgwxPY7v0kYvuPfnFHA57bqHxQc3lV51Oiaxlo4'
// };
//
// const style = {
//   theme: 'default',
//   text: 'default',
//   size: 'default',
//   type: 'default',
//   custom: {
//     borderRadius: 8,
//     height: 55,
//     'font-family': 'GilroyMedium',
//     'box-shadow': 'none'
//   }
// }
//
// const universallink = {
//   baseUrl: '',
//   universalLinkUrl: '',
//   needAdditionalRedirect: false
// }
//
// const params = {
//   oidc: oidcParams,
//   container: 'preview',
//   display: 'page',
//   mweb2app: false,
//   generateState: false,
//   style: style,
//   universallink: universallink
// }

function onSuccessCallback(result) {
  console.log('Вы успешно вошли: ', result)
}
function onErrorCallback(result) {
  console.log('Что-то пошло не так: ', result)
}

import LoadingPage from '../../../SubComponents/LoadingPage.vue';

export default {
  props: {
    //user: Object,
  },
  data: function () {
    return {
      email: '',
      mainPage: '',
      secondPage: '',
      videoPage: '',
      isLoading: false
    };
  },
  computed: {
    // isSelectingType: function () {
    //   return !this.isOnPhizPage && !this.isOnNonPhizPage
    // }
    canSendData: function () {

    }
  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    isValidEmail: function () {
      const regEx = new RegExp("[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}");
      return regEx.test(this.email);
    },
    isValidMain: function () {

    },
    handleMainPage(evt) {
      this.mainPage = evt.target.files[0];
      //console.log(this.mainPage);
    },
    handleSecondPage(evt) {
      this.secondPage = evt.target.files[0];
      //console.log(evt);
    },
    handleVideoPage(evt) {
      this.videoPage = evt.target.files[0];
    },
    sendToValidate: function () {
      const formData = new FormData()
      formData.set('email', this.email);
      formData.set('main', this.mainPage);
      formData.set('secondary', this.secondPage);
      formData.set('video', this.videoPage);

      if (this.isValidEmail() && this.mainPage && this.secondPage && this.videoPage) {
        this.isLoading = true;
        let self = this;
        this.axios.post('uploaddocs', formData, {})
          .then(function (response) {
          if (response.data.success) {
            self.isLoading = false;
            self.$router.push({ name: 'mainPage'});

          }
        });
      } else {
        UIkit.notification({message: 'Введите данные', status: 'danger'});
      }
      //console.log(formData.get('main') == false);
      //console.log(formData.get('secondary'));
    }
  },
  mounted: function () {
    this.axios.defaults.headers['token'] = this.getCookie('token');
  },
  components: {
    LoadingPage
  }
};
</script>
