<template lang="html">
  <div class="uk-card-footer offer_inp" style="padding: 5px 20px;">
    <div class="uk-grid-small uk-flex-middle" uk-grid>
      <!-- <div class="uk-width-auto">
        <a href="#" class="uk-icon-link uk-margin-small-left" uk-icon="icon: happy"></a>
      </div> -->
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
    }
  },
  methods: {
    sendMessage: function () {
      if (this.message.replace(/^\s+|\s+$/g, '') != "") {
        let self = this;
        this.axios.post('message/' + self.$route.params.uid + '/text', {
          content: self.message,
          type: 'text'
        })
          .then(function (response) {
           console.log(response);
           self.message = "";
           window.scrollTo(0,document.body.scrollHeight);
        });
      }
    }
  },
  mounted: function () {
    if (this.token) {
      this.axios.defaults.headers['token'] = this.token;
    }
  }
}
</script>
