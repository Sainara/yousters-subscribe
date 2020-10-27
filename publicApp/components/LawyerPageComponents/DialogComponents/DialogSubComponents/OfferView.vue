<template lang="html">
  <div class="uk-card-footer offer_inp" style="padding: 5px 20px;">
    <div class="uk-grid-small uk-flex-middle" uk-grid>

      <div class="uk-width-expand">
        <div class="uk-padding-small uk-padding-remove-horizontal">
          <h2>Ваше предложение</h2>
          <div uk-grid>
            <div class="uk-width-expand@m">
              <h1>{{offer.price}}</h1>
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

<style lang="css" scoped>
</style>
