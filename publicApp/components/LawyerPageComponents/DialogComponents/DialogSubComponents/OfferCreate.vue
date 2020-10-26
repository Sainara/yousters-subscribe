<template lang="html">
  <div class="uk-card-footer offer_inp" style="padding: 5px 20px;">
    <div class="uk-grid-small uk-flex-middle" uk-grid>

      <div class="uk-width-expand">
        <div class="uk-padding-small uk-padding-remove-horizontal">
          <h2>Создать предложение</h2>
          <div uk-grid>
            <div class="uk-width-expand@m">
              <input v-model="price" class="uk-input uk-form-large" type="number" placeholder="Введите сумму" style="border-radius: 7px;">
            </div>
            <div class="uk-width-auto@m">
              <a href="#" v-on:click.prevent="createOffer()" class="main-button" style="display: block; text-align: center;">Отправить предложение</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  // props: {
  //   user: Object
  // },
  data: function () {
    return {
      token: null,
      price: null
    }
  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    isMobile: function () {
      return screen.width <= 960;
    },
    createOffer: function () {
      if (this.price) {
        let self = this;
        this.axios.post('offer', {
          description: "AAAAAA",
          price: self.price,
          dialog_id: self.$route.params.uid
        })
          .then(function (response) {
          console.log(response);
          if (response.data.success) {

          }
        });
      }
    }
  },
  mounted: function () {
    this.token = this.getCookie('lawyer-token');
    this.axios.defaults.headers['token'] = this.token;
  }
}
</script>
