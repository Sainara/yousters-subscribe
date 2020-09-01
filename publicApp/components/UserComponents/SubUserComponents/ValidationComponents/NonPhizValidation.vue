<template>
  <div>
    <loading-page v-if="isLoading"></loading-page>
    <div v-else class="uk-container uk-container-xsmall">
      <div uk-grid class="non-phiz-wrap">
           <div>
             <input v-model="inn" class="uk-input uk-form-width-medium uk-form-large" type="text" name="inn" placeholder="ИНН">
           </div>
           <div style="margin-top:0px">
             <input v-model="email" class="uk-input uk-form-width-medium uk-form-large" type="email" name="email" placeholder="Email">
          </div>
      </div>
      <p style="margin: 20px 2px 7px" class="smalltitle">Запишите селфи-видео с паспортом в котором вы произносите ваш номер телефона. Должно быть видно вас и фото на паспорте</p>
      <div uk-form-custom="target: true">
          <input type="file" accept="video/*" @change="handleVideoPage($event)">
          <input class="uk-input uk-form-width-medium" type="text" placeholder="Выберите файл">
      </div>
      
      <p style="margin: 20px 10px" class="subtitle">Для идентификации необходимо перевести 1₽ с вашего расчетного счета, ссылка на счет на оплату появится, после ввода ИНН, Email и селфи-видео, так же ссылка будет доступна на экране профиля после нажатия кнопки "Оплатил"</p>
      <a href="#" v-on:click.prevent="toBill()" class="main-button secondary-color-but full-width-but" style="margin-bottom: 40px">Счет на оплату</a>
      <a style="margin-top: 70px" href="#" v-on:click.prevent="sendToValidate()" class="main-button full-width-but">Оплатил</a>
    </div>
  </div>
</template>
<script>
import LoadingPage from '../../../SubComponents/LoadingPage.vue';


export default {
  props: {
    //user: Object,
  },
  data: function () {
    return {
      inn: '',
      email: '',
      videoPage: '',
      isLoading: false
    };
  },
  computed: {
    // isSelectingType: function () {
    //   return !this.isOnPhizPage && !this.isOnNonPhizPage
    // }

  },
  methods: {
    sendToValidate: function () {

      const formData = new FormData()
      formData.set('email', this.email);
      formData.set('inn', this.inn);
      formData.set('video', this.videoPage);

      if (this.isValidEmail() && this.isValidINN() && this.videoPage) {
        this.isLoading = true;
        this.axios.post('uploadnonphiz', formData, {}).then(function (response) {
        if (response.data.success) {
            //response.data.data;
            self.isLoading = false;
            location.reload();
            //console.log(response.data.data);
          }
        });
      } else {
        UIkit.notification({message: 'Введите данные', status: 'danger'});
      }
    },
    toBill: function () {
      if (this.isValidEmail() && this.isValidINN()) {
        var link =  "https://you-scribe.ru/api/v1/bill?inn=" + this.inn + "&email=" + this.email + "&token=" + this.getCookie('token');
        var win = window.open(link, '_blank');
        win.focus();
      } else {
        UIkit.notification({message: 'Введите данные', status: 'danger'});
      }
    },
    isValidEmail: function () {
      const regEx = new RegExp("[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}");
      return regEx.test(this.email);
    },
    handleVideoPage(evt) {
      this.videoPage = evt.target.files[0];
    },
    isValidINN: function () {
      const regEx = new RegExp("^([0-9]{10}|[0-9]{12})$");
      return regEx.test(this.inn);
    },
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }
  },
  mounted: function () {
    //console.log(this.user);
    //document.addEventListener("backbutton", this.yourCallBackFunction, false);
  },
  components: {
    LoadingPage
  }
};
</script>
