<template>
    <q-layout
      ref="layout"
      view="hhh LpR fFf"
      :left-class="{'bg-grey-2': true}"
    >
      <q-toolbar slot="header" color="primary" >
        <q-btn
          flat
          @click="$refs.layout.toggleLeft()"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          {{ $t("messages.page_title") }}
        </q-toolbar-title>

        <q-btn flat @click="$router.replace('/logout')" >
          <q-icon name="exit to app" />
        </q-btn>
      </q-toolbar>

      <div slot="left">
        <!--
          Use <q-side-link> component
          instead of <q-item> for
          internal vue-router navigation
        -->
        <q-list highlight>
          <q-side-link item to="/admin/Merchants" exact v-if="this.$store.getters.getShowMerchants">
            <q-item-side icon="local post office" />
            <q-item-main v-bind:label="$t('messages.Menu_merchant')" sublabel="" />
          </q-side-link>
          <q-side-link item to="/admin/Accounts" exact v-if="this.$store.getters.getShowAccounts">
            <q-item-side icon="local post office" />
            <q-item-main v-bind:label="$t('messages.Menu_account')" sublabel="" />
          </q-side-link>
          <q-side-link item to="/admin/Transactions" exact v-if="this.$store.getters.getShowTransactions">
            <q-item-side icon="local post office" />
            <q-item-main v-bind:label="$t('messages.Menu_transaction')" sublabel="" />
          </q-side-link>
        </q-list>
      </div>

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
  QItemTile,
  QDialogSelect,
  QField,
  QScrollArea,
  Toast,
  QModal,
  QModalLayout,
  Alert,
  QToggle,
  QInput,
  QCheckbox,
  QSelect,
  QSlider,
  QTooltip,
  QCollapsible,
  clone,
  QSearch
} from 'quasar'
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
    QItemTile,
    QDialogSelect,
    QField,
    QScrollArea,
    Toast,
    QModal,
    QModalLayout,
    Alert,
    QToggle,
    QInput,
    QCheckbox,
    QSelect,
    QSlider,
    QTooltip,
    QCollapsible,
    clone,
    QSearch
  },
  data () {
    return {
      menu: []
    }
  },
  mounted () {
    this.getDataM()
  },
  created () {
    this.$auth.token('refresh-url', this.$config.get('auth.refreshUrl'))
    this.$auth.token('basic-auth-token', this.$config.get('auth.apiKey'))
    this.$auth.token('merchant-url', this.$config.get('auth.apiURL') + '/ListMerchantsForLogin')
    // this.$auth.token('menu-data', JSON.stringify(this.$config.get('runtime.menu')))
    document.cookie = 'default_auth_token='
    document.cookie = 'impersonate_auth_token='
    this.menu = this.$store.getters.getMenu
  },
  methods: {
    getDataM () {
      this.select = localStorage.getItem('merchant-data-select')
      this.selectOptions = []
      var conf = JSON.parse(localStorage.getItem('merchant-data'))
      for (var entry in conf) {
        this.selectOptions.push({'label': conf[entry].Name, value: conf[entry].ID})
      }
      console.log(this.$config.get('runtime.menu'))
      this.menu = this.$config.get('runtime.menu')
    }
  }
}
</script>

<style lang="stylus">
</style>
