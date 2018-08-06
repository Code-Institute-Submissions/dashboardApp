<template>
  <q-layout
    ref="layout"
    view="hhh LpR fFf"
    :left-class="{'bg-grey-2': true}"
  >
    <q-toolbar slot="header" color="primary">
      <q-btn
        flat
        @click="$refs.layout.toggleLeft()"
      >
        <q-icon name="menu" />
      </q-btn>

      <q-toolbar-title>
        Dashboard
      </q-toolbar-title>
    </q-toolbar>
    <!--
      Replace following <div> with
      <router-view /> component
      if using subRoutes
    -->
    <router-view />
  </q-layout>
</template>

<script>
  import {
    QLayout,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QListHeader,
    QItem,
    QItemSide,
    QItemMain,
    QSideLink,
    QItemTile
  } from 'quasar'
  import axios from 'axios'
  export default {
    name: 'index',
    components: {
      QLayout,
      QToolbar,
      QToolbarTitle,
      QBtn,
      QIcon,
      QList,
      QListHeader,
      QItem,
      QItemSide,
      QItemMain,
      QSideLink,
      QItemTile
    },
    data () {
      return {
      }
    },
    created () {
      this.$auth.token('refresh-url', this.$config.get('auth.refreshUrl'))
      this.$auth.token('basic-auth-token', this.$config.get('auth.apiKey'))
      this.$auth.token('merchant-url', this.$config.get('auth.apiURL') + '/ListMerchantsForLogin')
      this.$auth.token('menu-data', JSON.stringify(this.$config.get('runtime.menu')))
      document.cookie = 'default_auth_token='
      document.cookie = 'impersonate_auth_token='
      if (this.$route.query['access-token']) {
        this.$auth.token(null, this.$route.query['access-token'])
        this.$auth.token('refresh-token', this.$route.query['refresh-token'])
        this.$auth.watch.authenticated = true
        document.cookie = 'rememberMe=false'
        document.cookie = 'default_auth_token=' + this.$route.query['access-token']
        this.$auth.user({role: ['admin']})
        axios.post(this.$config.get('auth.apiURL') + '/ListMerchantsForLogin').then(response => {
          if (response.data.merchants !== null) {
            this.$auth.token('merchant-data', JSON.stringify(response.data.Merchants))
            this.$auth.token('merchant-data-select', response.data.Merchants[0].ID)
            var conf = this.$config.all()
            conf.runtime.merchant = response.data.Merchants
            this.$config.replace(conf)
          }
          else {
            this.$auth.token('merchant-data', '')
            this.$auth.token('merchant-data-select', '')
          }
        }, response => {
          // error callback
        })
        // Get menu entries
        axios.post(this.$config.get('auth.api2URL') + '/GetMenu', {}).then(response => {
          if (response.data !== null) {
            this.$auth.token('menu-data', JSON.stringify(response.data))
            this.$store.dispatch('updateMenu', response.data)
            var conf = this.$config.all()
            conf.runtime.menu = response.data
            this.$config.replace(conf)
          }
          else {
            this.$auth.token('menu-data', '')
          }
        }, response => {
          // error callback
        })
        this.$router.push({path: '/admin/Home'})
      }
    }
  }
</script>

<style lang="stylus">
</style>
