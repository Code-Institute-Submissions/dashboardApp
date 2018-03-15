import Vue from 'vue'
import VueRouter from 'vue-router'
import appConfig from 'utils/config.js'
Vue.use(VueRouter)

function load (component) {
  // '@' is aliased to src/components
  return () => import(`@/${component}.vue`)
}

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  base: appConfig.runtime.base,
  routes: [
    {
      path: '/',
      component: load('NonAuth'),
      children: [
        {path: '', name: 'login', component: load('Views/OAuth2')}
      ]
    },
    {
      path: '/admin',
      name: 'admin',
      component: load('Main'),
      children: [
        {path: 'Home', name: 'Home', component: load('Views/Home'), meta: {auth: {roles: 'admin'}}},
        {path: 'Merchants', name: 'Merchants', component: load('Views/Merchants'), meta: {auth: {roles: 'admin'}}},
        {path: 'Accounts', name: 'AccountsAll', component: load('Views/Accounts'), meta: {auth: {roles: 'admin'}}},
        {path: 'Accounts/:MerchantID', name: 'Accounts', component: load('Views/Accounts'), meta: {auth: {roles: 'admin'}}},
        {path: 'Transactions', name: 'TransactionsAll', component: load('Views/Transactions'), meta: {auth: {roles: 'admin'}}},
        {path: 'Transactions/:MerchantID/:AccountID', name: 'Transactions', component: load('Views/Transactions'), meta: {auth: {roles: 'admin'}}},
        {path: 'Chargebacks', name: 'ChargebacksAll', component: load('Views/Chargebacks'), meta: {auth: {roles: 'admin'}}},
        {path: 'Chargebacks/:MerchantID/:AccountID/:PaymentGatewayReference?', name: 'Chargebacks', component: load('Views/Chargebacks'), meta: {auth: {roles: 'admin'}}},
        {path: 'Settlements', name: 'SettlementsAll', component: load('Views/Settlements'), meta: {auth: {roles: 'admin'}}},
        {path: 'Settlements/:MerchantID/:AccountID', name: 'Settlements', component: load('Views/Settlements'), meta: {auth: {roles: 'admin'}}},
        {path: 'Settlements/:MerchantID/:AccountID/:SettlementID', name: 'SettlementID', component: load('Views/Settlements'), meta: {auth: {roles: 'admin'}}}
      ]
    },
    // Always leave this last one
    {path: '/logout', name: 'logout', component: load('Views/Logout')},
    { path: '*', name: '404', component: load('Error404') } // Not found
  ]
})
