import Vue from 'vue';
const axios = require('axios').default;


var vm = new Vue({
  el: '#app',
  data: {
    user: 'Artem'
  },
  created: function () {
    // `this` указывает на экземпляр vm
    console.log('Значение a: ' + this.user)
  }
})
