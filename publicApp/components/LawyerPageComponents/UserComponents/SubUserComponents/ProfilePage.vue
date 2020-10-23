<template>
  <div>
    <nav class="uk-navbar-container" uk-navbar>
      <div class="uk-navbar-left" style="width:100%">
          <ul class="uk-navbar-nav" style="width:100%">
              <li style="width:50%"
                v-for="tab in tabs"
                v-bind:key="tab"
                v-bind:class="['uk-parent', { 'uk-active': currentTab == tab}]">
                <a v-on:click.prevent="setTab(tab)" class="youstersnav" href="">{{tab}}</a>
              </li>
          </ul>
      </div>
  </nav>
    <div class="mobile-padding">
      <div class="uk-container uk-container-small">
          <!-- <router-link v-if="currentTab == 'Документы'" class="main-button full-width-but" to="/add">+ Добавить документ</router-link> -->
          <keep-alive>
            <component v-bind:is="currentTabComponent" v-bind:user="user" v-bind:av-offers="avOffers"></component>
          </keep-alive>

      </div>
    </div>
  </div>

</template>

<script>
import Active from './ProfileComponents/Active.vue';
import ActiveOffers from './OfferComponents/ActiveOffers.vue'
import AviableOffers from './OfferComponents/AviableOffers.vue'

export default {
  props: {
    user: Object,
  },
  data: function () {
    return {
      avOffers: [],
      tabs: [],
      currentTab: '',
    }
  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    getAvOffers: function () {
      let self = this;
      this.axios.get('dialog/lawyer')
        .then(function (response) {
          console.log(response);
        if (response.data.success) {
          self.avOffers = response.data.data;

        }
      });
    },
    setTab: function (tab) {
      this.currentTab = tab
      //this.$route.query.page = 'docs';
      //console.log(this.$route.query.page);
    }
  },
  computed: {
    currentTabComponent: function() {
      switch (this.currentTab) {
        case 'Активные офферы':
          return 'ActiveOffers';
          break;
        case 'Доступные офферы':
          return 'AviableOffers'
        case 'Профиль':
          return 'Active';
          break;
        default:
          return '';
          break;
      }
    }
  },
  mounted: function () {
    this.axios.defaults.headers['token'] = this.getCookie('lawyer-token');
    this.getAvOffers();
    this.tabs = ['Доступные офферы','Активные офферы', 'Профиль'];
    this.currentTab = 'Профиль';
  },
  components: {
    Active,
    // DocsTable
  }
};
</script>
