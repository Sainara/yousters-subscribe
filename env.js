export default {
  database_url: process.env.DATABASE_URL || 'postgres://root:Yousters-big-secret1@rc1c-4ifdgz6r6n8nnbm0.mdb.yandexcloud.net:6432/you-scribe?ssl=true',
  //test_database_url: process.env.TEST_DATABASE_URL,
  secret: process.env.SECRET || 'youstersbigbigsecret',
  port: process.env.PORT || 8000,
  sendGridMailAPIKey: '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',
  yandexCheckoutShopId: '729974',
  yandexCheckoutSecretKey: 'live_QflFfq4UKgFm8wsKHQCN3Nsq-hVuJPOJD0vl7lu7mMY',
  //TEST
  // yandexCheckoutShopId: '731656',
  // yandexCheckoutSecretKey: 'test_ZEOMW81yr-EBYgZ18ANK5P99kCMwwp6-yGMDVVHxa3A',
  sms_ru_api_id: 'BE2FD0CD-F301-8524-B59F-A401C359E329',
  sberAuthClientID: 'a5a2d1b0-85d1-4caf-9bea-03cd21de3786',
  sberAuthClientSecret: 'S1jE5eN8oN5gG3xI8xW8tJ5pK0qP6lF4wR1rP5bO3rY8tA8lX5',
  tnkf_terminal_id: '1595602181033',
  tnkf_terminal_secret: 'l4nimdyg8godqe78',
  tnkf_openAPI_id: 't.2w7dOUSTDG8ce4KxiaWWdinlmrD35fgs99T-CSwev_UYADzn79dnYYqoPIP-JSnX-Un3zf8ybKEv7kc7m3Dw_Q',
  dadata_apiKey: '7f51e1b0f4e6aaf6695e7625b2d13405eb5954cf',
  iap_secret: '94036ff7631f455e8288e782ad5d91a1'
}
