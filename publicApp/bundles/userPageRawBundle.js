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

import MainPage from '../components/MainPage.vue'
import CreateAgreement from '../components/CreateAgreement.vue'


const Bar = { template: '<div>bar</div>' }

const routes = [
  { path: '/', component: MainPage },
  { path: '/add', component: CreateAgreement }
]

// 3. Создаём экземпляр маршрутизатора и передаём маршруты в опции `routes`
// Вы можете передавать и дополнительные опции, но пока не будем усложнять.
const router = new VueRouter({
  routes // сокращённая запись для `routes: routes`
})

var vm = new Vue({
  router
}).$mount('#app')
