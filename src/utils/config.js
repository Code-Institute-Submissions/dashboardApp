export default {
  auth: {
    authURL: 'https://auth-test.paywiser.eu',
    apiURL: 'https://api-auth-test.paywiser.eu',
    api2URL: 'https://gateway.paywiser.eu/PaymentGateway.WL.Test',
    accessTokenTypeID: 1,
    apiKey: '04dc7792-9d07-43a3-b508-94d240df955b',
    userTypeID: 1,
    returnURL: 'http://localhost:22555/Mailer/',
    // returnURL: 'http://bufo-test.info/Mailer/',
    sdkUrl: 'https://auth-test.paywiser.eu/auth/sdk.js',
    refreshUrl: 'https://api-auth-test.paywiser.eu/RequestNewAccessToken'
  },
  runtime: {
    base: '/Mailer/',
    menu: {
      ShowMerchants: false,
      ShowAccounts: false,
      ShowTransactions: false,
      showChargebacks: false
    },
    merchant: {}
  }
}
