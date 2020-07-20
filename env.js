export default {
  database_url: process.env.DATABASE_URL || 'postgres://xauepbdpkzgmjy:9bde86bdaa7952806e058d77c008ec30e37d0a8115d8585369b013d2b0caeebf@ec2-54-75-248-49.eu-west-1.compute.amazonaws.com:5432/d4cv79qv03n5gm',
  //test_database_url: process.env.TEST_DATABASE_URL,
  secret: process.env.SECRET || 'youstersbigbigsecret',
  PORT: process.env.PORT || 8000,
  yandexCheckoutShopId: '',
  yandexCheckoutSecretKey: '',
  //environment: process.env.NODE_ENV,

}
