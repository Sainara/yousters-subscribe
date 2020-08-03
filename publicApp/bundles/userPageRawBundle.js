import Vue from 'vue';
const Axios = require('axios').default;
import VueAxios from 'vue-axios';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

Vue.use(VueAxios, Axios.create({
  baseURL: 'https://you-scribe.ru/api/v1/',
  headers: {
    'Accept' : 'application/json',
    'ContentType' : 'application/json'
  }
}));

Vue.config.devtools = true;

import App from '../components/App.vue'

var vm = new Vue({
  el: '#app',
  data: {},
  template: "<App/>",
  mounted: function () {
    // `this` указывает на экземпляр vm
    //console.log(App);
    // axios
    //   .get('https://api.coindesk.com/v1/bpi/currentprice.json')
    //   .then(response => (this.user = response));
    // console.log(this.user)
  },

  components: {
    App
  }
})
