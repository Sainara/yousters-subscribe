export default {
  database_url: process.env.DATABASE_URL || 'postgres://root:Yousters-big-secret1@rc1c-4ifdgz6r6n8nnbm0.mdb.yandexcloud.net:6432/you-scribe?ssl=true',
  //test_database_url: process.env.TEST_DATABASE_URL,
  secret: process.env.SECRET || 'youstersbigbigsecret',
  port: process.env.PORT || 8000,
  yandexCheckoutShopId: '',
  yandexCheckoutSecretKey: '',
  sms_ru_api_id: 'BE2FD0CD-F301-8524-B59F-A401C359E329'

}
