// === DEFAULT / CUSTOM STYLE ===
// WARNING! always comment out ONE of the two require() calls below.
// 1. use next line to activate CUSTOM STYLE (./src/themes)
// require(`./themes/app.${__THEME}.styl`)
// 2. or, use next line to activate DEFAULT QUASAR STYLE
require(`quasar/dist/quasar.${__THEME}.css`)
// ==============================

// Uncomment the following lines if you need IE11/Edge support
// require(`quasar/dist/quasar.ie`)
// require(`quasar/dist/quasar.ie.${__THEME}.css`)

import Vue from 'vue'
import Vuex from 'vuex'
import Quasar from 'quasar'
import router from './router'
import VueRouter from 'vue-router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueAuth from '@bordman1/vue-auth'
import VueConfig from 'vue-configuration'
import appConfig from 'utils/config.js'
import Vuelidate from 'vuelidate'
import VueI18n from 'vue-i18n'
import locales from 'utils/locales/locale.js'
import datetime from 'utils/locales/datetime.js'

Vue.config.productionTip = false
Vue.use(Quasar) // Install Quasar Framework
Vue.use(require('@bordman1/vue-moment'))
if (__THEME === 'mat') {
  require('quasar-extras/roboto-font')
}
Vue.use(Vuex)
import 'quasar-extras/material-icons'
// import 'quasar-extras/ionicons'
// import 'quasar-extras/fontawesome'
// import 'quasar-extras/animate'
Vue.use(VueAxios, axios)
Vue.use(VueRouter)
Vue.use(Vuelidate)
Vue.router = router
Vue.use(VueConfig, {
  config: appConfig
})
// Vue.http.options.root = process.env.API_URL
axios.interceptors.response.use(undefined, function (error) {
  if (error.response.status === 401 && error.response.statusText !== '') {
    var refreshToken = Vue.auth.token('refresh-token')
    return new Promise((resolve, reject) => {
      Vue.auth.refresh({
        params: {},
        data: {'MerchantID': Vue.auth.token('merchant-data-select')},
        headers: {Authorization: 'Basic ' + btoa(appConfig.auth.apiKey + ':') + ' ,Bearer ' + refreshToken},
        success: function (res) {
          if (res.status === 200) {
            if (res.data.StatusCode === -1) {
              Vue.auth.logout({
                redirect: {name: 'logout'}
              })
            }
            else {
              Vue.auth.user(res.data)
              Vue.auth.token(null, res.headers.accesstoken)
              Vue.auth.user({role: ['admin']})
              Vue.auth.watch.authenticated = true
              // request.headers['Authorization'] = 'Bearer ' + res.headers.accesstoken
              error.config.headers.Authorization = 'Bearer ' + res.headers.accesstoken
            }
          }
          else {
            Vue.auth.logout({
              redirect: {name: 'logout'}
            })
          }
        },
        error: function () {
          Vue.auth.logout({
            redirect: {name: 'logout'}
          })
        }
      }).then(function () {
        resolve(axios(error.config))
      })
      /* Vue.auth.logout({
          redirect: { name: 'login' }
        }) */
    })
  }
  // return Promise.reject(error)
}
)
Vue.use(VueAuth, {
  auth: require('utils/bearer.js'),
  http: require('@bordman1/vue-auth/drivers/http/axios.1.x.js'),
  router: require('@bordman1/vue-auth/drivers/router/vue-router.2.x.js'),
  refreshData: {url: appConfig.auth.refreshUrl, method: 'POST', enabled: true, interval: 0},
  tokenStore: ['localStorage'],
  _invalidToken: function (res) {},
  rolesVar: 'role',
  loginData: {fetchUser: false},
  authRedirect: '/'
})

Vue.mixin({
  methods: {
    $ready (fn) {
      setTimeout(() => {
        this.$nextTick(fn)
      }, 1000)
    }
  }
})
Vue.router.beforeEach((to, from, next) => {
  if (to.name === '404') {
    next({path: '/logout'})
  }
  next()
})
const state = {
  menu: JSON.parse(localStorage.getItem('menu-data'))
}
var getters = {
  getMenu: state => state.menu
}
var mutations = {
  UPDATE_MENU: (state, payload) => {
    state.menu = payload
  }
}
var actions = {
  updateMenu: (context, payload) => {
    context.commit('UPDATE_MENU', payload)
  }
}
export const store = new Vuex.Store({
  state: state,
  getters: getters,
  mutations: mutations,
  actions: actions
})
Vue.config.lang = 'en'
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: 'en',
  messages: locales,
  dateTimeFormats: datetime
})
Quasar.start(() => {
  /* eslint-disable no-new */
  new Vue({
    i18n: i18n,
    el: '#q-app',
    router,
    store,
    render: h => h(require('./App').default)
  })
})
