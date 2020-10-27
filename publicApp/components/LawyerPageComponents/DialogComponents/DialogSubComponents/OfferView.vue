<template lang="html">
  <div class="uk-card-footer offer_inp" style="padding: 5px 20px;">
    <div class="uk-grid-small uk-flex-middle" uk-grid>
      <div class="uk-width-expand">
        <div class="uk-padding-small uk-padding-remove-horizontal">
          <h3>Ваше предложение</h3>
          <div uk-grid>
            <div class="uk-width-expand@m">
              <h1 style="margin-bottom: 0px">{{offer.price}}₽</h1>
              <p style="margin-top: 0px">Будет надеяться, что клиент выберет именно вас</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    offer: Object
  },
}
</script>
