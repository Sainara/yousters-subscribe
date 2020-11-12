<template lang="html">
  <div class="uk-card-footer offer_inp" style="padding: 5px 20px;">
    <div class="uk-grid-small uk-flex-middle" uk-grid>
      <div class="uk-width-auto">
        <ul class="uk-iconnav uk-margin-small-right">
          <li>
            <a href="#" v-on:click.prevent="" uk-toggle="target: #modal-photo" uk-icon="icon: image; ratio: 2"></a>
          </li>
          <li>
            <a href="#" v-on:click.prevent="" uk-toggle="target: #modal-doc" uk-icon="icon:  file-pdf; ratio: 2"></a>
          </li>
        </ul>
      </div>
      <div class="uk-width-expand">
        <div class="uk-padding-small uk-padding-remove-horizontal">
          <textarea v-model="message" class="uk-textarea uk-border-remove" rows="2" placeholder="Введите сообщение"></textarea>
        </div>
      </div>
      <div class="uk-width-auto">
        <ul class="uk-iconnav uk-margin-small-right">
          <li>
            <a href="#" v-on:click.prevent="sendMessage()" uk-icon="icon: arrow-up; ratio: 2"></a>
          </li>
          <!-- <li>
          <a href="#" uk-icon="icon: location"></a>
        </li> -->
      </ul>
    </div>
  </div>
  <div id="modal-photo" uk-modal>
    <div class="uk-modal-dialog uk-modal-body">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <h2 class="uk-modal-title">Загрузить фотографию</h2>
      <div uk-form-custom="target: true">
        <input id="photo_inp" type="file" accept="image/*" @change="handleFile($event)">
        <input id="photo_inp_title" class="uk-input uk-form-width-medium" type="text" placeholder="Выберите файл">
      </div>
      <a href="#" v-on:click.prevent="sendPhoto()" class="main-button" style="margin-top: 20px; display: block; text-align: center;">Отправить</a>
    </div>
  </div>
  <div id="modal-doc" uk-modal>
    <div class="uk-modal-dialog uk-modal-body">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <h2 class="uk-modal-title">Загрузить файл</h2>
      <div uk-form-custom="target: true">
        <input id="file_inp" type="file" accept="application/pdf" @change="handleFile($event)">
        <input id="file_inp_title" class="uk-input uk-form-width-medium" type="text" placeholder="Выберите файл">
      </div>
      <a href="#" v-on:click.prevent="sendDoc()" class="main-button" style="margin-top: 20px; display: block; text-align: center;">Отправить</a>
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    token: Object
  },
  data: function () {
    return {
      message: "",
      isShowDocUpload: false,
      isShowPhotoUpload: false,
      file: ''
    }
  },
  methods: {
    sendMessage: function () {
      if (this.message.replace(/^\s+|\s+$/g, '') != "") {
        let self = this;
        console.log("#######");
        this.axios.post('message/' + self.$route.params.uid + '/text', {
          content: self.message,
          type: 'text'
        }).then(function (response) {
          console.log(response);
          self.message = "";
          window.scrollTo(0,document.body.scrollHeight);
        });
      } else {
        UIkit.notification({message: 'Введите сообщение', status: 'danger'})
      }
    },
    sendPhoto: function () {
      const formData = new FormData()
      formData.set('type', 'image');
      formData.set('file', this.file);

      if (this.file) {
        this.isLoading = true;
        let self = this;
        this.axios.post('message/' + self.$route.params.uid + '/file', formData, {})
        .then(function (response) {
          console.log(response);
          self.isLoading = false;
          if (response.data.success) {
            UIkit.modal(document.getElementById('modal-photo')).hide();
            self.file = null;
            document.getElementById("photo_inp").value = "";
            document.getElementById("photo_inp_title").value = "";
            self.$forceUpdate();
          } else {
            UIkit.notification({message: 'Ошибка(', status: 'danger'});
          }
        });
      } else {
        UIkit.notification({message: 'Выберите файл', status: 'danger'})
      }
    },
    sendDoc: function () {
      const formData = new FormData()
      formData.set('type', 'document');
      formData.set('file', this.file);

      if (this.file) {
        this.isLoading = true;
        let self = this;
        this.axios.post('message/' + self.$route.params.uid + '/file', formData, {})
        .then(function (response) {
          self.isLoading = false;
          if (response.data.success) {
            UIkit.modal(document.getElementById('modal-doc')).hide();
            self.file = null;
            document.getElementById("file_inp").value = "";
            document.getElementById("file_inp_title").value = "";
            self.$forceUpdate();
          } else {
            UIkit.notification({message: 'Ошибка(', status: 'danger'});
          }
        });
      } else {
        UIkit.notification({message: 'Выберите файл', status: 'danger'})
      }
    },
    handleFile(evt) {
      this.file = evt.target.files[0];
    },
  },
  mounted: function () {
    if (this.token) {
      this.axios.defaults.headers['token'] = this.token;
    }
  }
}
</script>
