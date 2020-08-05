<template>
  <div class="preview"></div>
</template>
<script>
import Sberid from './sberid-sdk';

const oidcParams = {
  response_type: 'code',
  client_type: 'PRIVATE',
  client_id: 'a5a2d1b0-85d1-4caf-9bea-03cd21de3786',
  redirect_uri: 'https://you-scribe.ru/oidc/success',
  scope: 'openid+name',
  state: 'NfZscgwxPY7v0kYvuPfnFHA57bqHxQc3lV51Oiaddd4',
  nonce: 'NfZscgwxPY7v0kYvuPfnFHA57bqHxQc3lV51Oiaxlo4'
};

const style = {
  theme: 'default',
  text: 'default',
  size: 'default',
  type: 'default',
  custom: {
    borderRadius: 8,
    height: 55,
    'font-family': 'GilroyMedium',
    'box-shadow': 'none'
  }
}

const universallink = {
  baseUrl: '',
  universalLinkUrl: '',
  needAdditionalRedirect: false
}

const params = {
  oidc: oidcParams,
  container: 'preview',
  display: 'page',
  mweb2app: false,
  generateState: false,
  style: style,
  universallink: universallink
}

function onSuccessCallback(result) {
  console.log('Вы успешно вошли: ', result)
}
function onErrorCallback(result) {
  console.log('Что-то пошло не так: ', result)
}

export default {
  props: {
    //user: Object,
  },
  data: function () {
    return {
      sbSDK: ''
    };
  },
  computed: {
    // isSelectingType: function () {
    //   return !this.isOnPhizPage && !this.isOnNonPhizPage
    // }

  },
  methods: {
    getCookie: function (name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }
  },
  mounted: function () {
    // let recaptchaScript = document.createElement('script')
    //   recaptchaScript.setAttribute('src', '/js/sberid-sdk.js')
    //   document.head.appendChild(recaptchaScript)
    //console.log(this.user);
    //document.addEventListener("backbutton", this.yourCallBackFunction, false);


    console.log(params);

    this.sbSDK = new Sberid.SberidSDK(params, onSuccessCallback, onErrorCallback);
  },
  components: {

  }
};
</script>
