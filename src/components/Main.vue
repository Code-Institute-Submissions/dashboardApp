<template>
    <q-layout
      ref="layout"
      view="hHh LpR fFf"
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
          <q-tooltip anchor="bottom left" self="bottom left" :offset="[-40, 0]">
            {{ $t("messages.logout") }}
          </q-tooltip>
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
            <q-item-side icon="view list" />
            <q-item-main v-bind:label="$t('messages.Menu_merchant')" sublabel="" />
          </q-side-link>
          <q-side-link item to="/admin/Accounts" exact v-if="this.$store.getters.getShowAccounts">
            <q-item-side icon="view list" />
            <q-item-main v-bind:label="$t('messages.Menu_account')" sublabel="" />
          </q-side-link>
          <q-side-link item to="/admin/Transactions" exact v-if="this.$store.getters.getShowTransactions">
            <q-item-side icon="view list" />
            <q-item-main v-bind:label="$t('messages.Menu_transaction')" sublabel="" />
          </q-side-link>
          <q-side-link item to="/admin/Chargebacks" exact v-if="this.$store.getters.getShowChargebacks">
            <q-item-side icon="view list" />
            <q-item-main v-bind:label="$t('messages.Menu_chargebacks')" sublabel="" />
          </q-side-link>
          <q-side-link item to="/admin/Settlements" exact v-if="this.$store.getters.getShowSettlements">
            <q-item-side icon="view list" />
            <q-item-main v-bind:label="$t('messages.Menu_settlements')" sublabel="" />
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
  QSearch
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
    axios.post(this.$config.get('auth.api2URL') + '/ListMerchants', {}).then(response => {
      if (response.data !== null) {
        this.$auth.token('mtotalpages-data', JSON.stringify(response.data.Pages.TotalPages))
        this.$store.dispatch('updateMtotalpages', response.data.Pages.TotalPages)
        var conf = this.$config.all()
        conf.runtime.mtotalpages = response.data.Pages.TotalPages
        this.$config.replace(conf)
      }
    }, response => {
      // error callback
    })
  },
  methods: {
    getDataM () {
      this.menu = this.$config.get('runtime.menu')
    }
  }
}
</script>

<style lang="stylus">
</style>
