<template>
  <div>
    <error-page v-if="nonAuth" message='У вас нет доступа'></error-page>
    <main v-else>
      <h1>Yousters Subscribe</h1>
      <h3 style="margin-bottom: 40px; margin-top: -5px">Добавление документа</h3>
      <span v-if="isLoading" class="uk-margin-small-right" uk-spinner="ratio: 3"></span>
      <div v-else class="uk-container uk-container-small">
        <div class="add-agreement-wrap">
          <input v-model="agrName" class="uk-input" type="text" name="filename" placeholder="Название документа (необязательно)">
        </div>
        <div style="margin: 20px 10px; text-align: center;">
          <div uk-form-custom="target: true">
              <input type="file" accept="application/pdf" @change="handleFile($event)">
              <input class="uk-input uk-form-width-medium" type="text" placeholder="Выберите файл">
          </div>
          <p class="subtitle" style="margin-top: 10px; font-size: 13px;">Подходят файлы в формате PDF весом не более 50Мб</p>
        </div>
        <a style="margin-top: 70px" href="#" v-on:click.prevent="addAgreement()" class="main-button full-width-but">Загрузить</a>
      </div>
    </main>

  </div>
</template>

<script>
import ErrorPage from './SubComponents/ErrorPage.vue';

export default {
  data: function() {
    return {
      nonAuth: false,
      isLoading: false,
      agrName: '',
      token: '',
      file: ''
    };
  },
  computed: {
  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    handleFile(evt) {
      this.file = evt.target.files[0];
      if (this.agrName == '') {
        this.agrName = evt.target.files[0].name;
      }
      //console.log(this.mainPage);
    },
    addAgreement:function () {
      const formData = new FormData()
      formData.set('title', this.agrName);
      formData.set('doc', this.file);

      if (this.agrName && this.file) {
        this.isLoading = true;
        let self = this;
        this.axios.post('uploadagreement', formData, {})
          .then(function (response) {
          if (response.data.success) {
            self.isLoading = false;
            self.$router.go(-1);
          } else {
            UIkit.notification({message: 'Ошибка(', status: 'danger'});
          }
        });
      } else {
        UIkit.notification({message: 'Заполните все поля', status: 'danger'});
      }
    }
  },
  mounted: function () {
    this.token = this.getCookie('token');
    if (!this.token) {
      this.nonAuth = true;
    } else {
      this.axios.defaults.headers['token'] = this.token;
      //this.getUser();
      //console.log(this.token);
    }
  },
  components: {
    ErrorPage
  }
};
</script>
