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
    <div v-bind:class="[ isMobile ? 'mobile-padding' : 'desctop-padding' ]">
      <div class="uk-container uk-container-small">
        <!-- <template v-if="isMobile"> -->
          <router-link v-if="currentTab == 'Документы'" class="main-button full-width-but" to="/add">+ Добавить документ</router-link>
          <keep-alive>
            <component v-bind:is="currentTabComponent" v-bind:user="user" v-bind:agreements='agreements'>{{user.phone}}</component>
          </keep-alive>
        <!-- </template> -->
        <!-- <template v-else>
          <div uk-grid>
            <div class="uk-width-expand">
                <div class="uk-card uk-card-default uk-card-small uk-card-body">
                  <h2>Документы <router-link class="main-button" style="padding: 0px 11px; float: right;" to="/add">+</router-link></h2>
                  <docs-table v-bind:user="user" v-bind:agreements="agreements"></docs-table>
                </div>
            </div>
            <div class="uk-width-large">
                <div class="uk-card uk-card-default uk-card-small uk-card-body">
                  <not-on-validation v-if="isNotOnValidation">{{user.phone}}</not-on-validation>
                  <on-validation v-if="isOnValidation">{{user.phone}}</on-validation>
                  <active v-if="user.isvalidated" v-bind:user="user"></active>
                </div>
            </div>
          </div>
        </template> -->
      </div>
    </div>
  </div>

</template>

<script>
import NotOnValidation from './ProfileComponents/NotOnValidation.vue';
import OnValidation from './ProfileComponents/OnValidation.vue';
import Active from './ProfileComponents/Active.vue';
import DocsTable from './DocsComponents/DocsTable.vue'



export default {
  props: {
    user: Object,
  },
  data: function () {
    return {
      agreements: [],
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
    getAgreements: function () {
      let self = this;
      this.axios.post('getagreements')
        .then(function (response) {
          //console.log(response);
        if (response.data.success) {
          self.agreements = response.data.data;

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
    isOnValidation: function () {
      return this.user.is_on_validation;
    },
    isNotOnValidation: function () {
      return !this.user.is_on_validation &&!this.user.isvalidated;
    },
    currentTabComponent: function() {
      switch (this.currentTab) {
        case 'Документы':
          return 'DocsTable';
          break;
        case 'Профиль':
        if (!this.user.is_on_validation &&!this.user.isvalidated) {
          return 'NotOnValidation';
        }
          if (this.user.is_on_validation) {
              return 'OnValidation';
          } else {
              return 'Active';
          }
          break;
        default:
          return '';
          break;
      }
    }
  },
  mounted: function () {
    this.axios.defaults.headers['token'] = this.getCookie('token');
    this.getAgreements();
    this.tabs = [ "Документы", 'Профиль'];
    if (this.user.is_on_validation) {
      this.currentTab = 'Профиль';
    } else {
      this.currentTab = 'Документы';
    };
  },
  components: {
    NotOnValidation,
    OnValidation,
    Active,
    DocsTable
  }
};
</script>
