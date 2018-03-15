<template>
  <div class="layout-padding justify-right">
    <p></p>
    
    <div class="row">
      <div class="col-md-auto">
        <q-field >
          <q-datetime 
            type="date" 
            v-bind:placeholder="$t('messages.date_from')"
            v-bind:prefix="$t('messages.show_settlements_from_date')"
            align="center"
            :debounce="500" 
            monday-first
            format="DD.MM.YYYY"
            v-model.lazy="searchDateFrom" 
            @change="getData" />
        </q-field>
      </div>
      
      <div class="col-md-auto" style="padding-left: 1vw; padding-right: 2vw;">
        <q-field >
          <q-datetime 
            type="date" 
            v-bind:placeholder="$t('messages.date_to')"
            v-bind:prefix="$t('messages.show_to_date')"
            align="center"
            :debounce="500" 
            monday-first
            format="DD.MM.YYYY"
            v-model.lazy="searchDateTo" 
            @change="getData" />
        </q-field>
      </div>
      <div class="col-md-3" style="margin-top: -10px" v-if="this.$store.getters.getShowSettlements">
        <div class="auto">
          <q-select
            v-model="MerchantID"
            :options="selectMerchantOptions"
            @change="getData"
            style="width: 100%"
            filter
            filter-placeholder="Search..."
            v-bind:float-label="$t('messages.merchant_select')"
          />
        </div>
      </div>
      <div class="col-md-auto" style="margin-top: -10px; min-width: 150px;" v-if="this.$store.getters.getShowSettlements">
        <div class="auto">
          <q-select
            v-model="AccountID"
            :options="selectAccountOptions"
            @input="getData"
            style="width: 100%"
            v-bind:float-label="$t('messages.account_select')"
            :disabled=selectAccountDisabled
          />
        </div>
      </div>
    </div>
    
    <q-data-table
      :data="table"
      :config="configs"
      :columns="columns"
      ref="dataTable">
      
      <template slot="col-ShowMore" slot-scope="cell">
        <q-btn small round flat v-on:click="viewSettlementDetails()"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.settlement_details") }}
          </q-tooltip>
        </q-btn>
      </template>

      
    </q-data-table>
    <div class="auto">
      <q-pagination
        v-model="page"
        :max=maxPages
      ></q-pagination>
      <div class="float-right" >
        {{ $t("messages.download_as_csv") }}
        <q-btn round flat v-on:click="getCsv()"><q-icon name="get app" color="green" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.download_csv") }}
          </q-tooltip>
        </q-btn>
      </div>

    </div>
    
    <q-modal ref="layoutModalShowSettlementDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowSettlementDetails.close()"><q-icon name="clear" /></q-btn>
          <q-toolbar-title>
            {{ $t("messages.settlement_info") }}
          </q-toolbar-title>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewSettlement.SettlementNumber" v-bind:stack-label="$t('messages.SettlementNumber')" readonly />
          <q-input v-model="ViewSettlement.SettlementType" v-bind:stack-label="$t('messages.SettlementType')" readonly />
          <q-input v-model="ViewSettlement.SettlementDateFrom" v-bind:stack-label="$t('messages.SettlementDateFrom')" readonly />
          <q-input v-model="ViewSettlement.SettlementDateTo" v-bind:stack-label="$t('messages.SettlementDateTo')" readonly />
          <q-input v-model="ViewSettlement.TransactionsPaidSum" v-bind:stack-label="$t('messages.TransactionsPaidSum')" readonly />
          <q-input v-model="ViewSettlement.ReservationsPaidOutSum" v-bind:stack-label="$t('messages.ReservationsPaidOutSum')" readonly />
          <q-input v-model="ViewSettlement.CostsSum" v-bind:stack-label="$t('messages.CostsSum')" readonly />
          <q-input v-model="ViewSettlement.Total" v-bind:stack-label="$t('messages.Total')" readonly />

        </div>
      </q-modal-layout>
    </q-modal>
    
  </div>
</template>

<script>
  import {
    QDataTable,
    QLayout,
    QField,
    QInput,
    QCheckbox,
    QSelect,
    QSlider,
    QBtn,
    QIcon,
    QTooltip,
    QCollapsible,
    QPagination,
    QSearch,
    QModal,
    QModalLayout,
    QToolbar,
    QToolbarTitle,
    Loading,
    Alert,
    QDatetime,
    date
  } from 'quasar'
  import axios from 'axios'
  var unwatchers = null
  export default {
    mounted () {
      this.setupWatchers()
      this.getDateRange()
      this.getMerchantData()
    },
    data () {
      return {
        table: [],
        page: 1,
        searchData: '',
        searchDateFrom: '',
        searchDateTo: '',
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '100px' },
          { label: this.$t('messages.SettlementID'), field: 'SettlementID', sort: false, type: 'string' },
          { label: this.$t('messages.SettlementNumber'), field: 'SettlementNumber', sort: true, type: 'string' },
          { label: this.$t('messages.SettlementType_short'), field: 'SettlementType', sort: false, type: 'guid' },
          { label: this.$t('messages.SettlementDateFrom_short'), field: 'SettlementDateFrom', sort: true, type: 'date' },
          { label: this.$t('messages.SettlementDateTo_short'), field: 'SettlementDateTo', sort: true, type: 'boolean' }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_settlements'),
          rowHeight: '50px',
          bodyStyle: {
            maxHeight: '66vh'
          }
        },
        maxPages: 1,
        ViewSettlement: {},
        sort: {
          column: 'Name',
          dir: 'asc'
        },
        MerchantID: 1,
        selectMerchantOptions: [],
        AccountID: 1,
        selectAccountOptions: [],
        selectAccountDisabled: false,
        SettlementID: 1
      }
    },

    watch: {
      page () {
        this.getData()
      },
      MerchantID () {
        this.getData()
        this.checkAccountDisabled()
      }
    },
    computed: {
      url () {
        var mID
        if (this.$route.params.MerchantID !== '') {
          this.MerchantID = this.$route.params.MerchantID
          this.$route.params.MerchantID = ''
        }
        mID = this.MerchantID
        if (mID === 1) {
          mID = ''
        }
        var aID
        if (this.$route.params.AccountID !== '') {
          this.AccountID = this.$route.params.AccountID
          this.$route.params.AccountID = ''
        }
        aID = this.AccountID
        if (aID === 1) {
          aID = ''
        }
        var sID
        if (this.$route.params.SettlementID !== '') {
          this.SettlementID = this.$route.params.SettlementID
          this.$route.params.SettlementID = ''
        }
        sID = this.SettlementID
        if (sID === 1) {
          sID = ''
        }
        var ret = {MerchantID: mID, AccountID: aID, DateFrom: this.searchDateFrom, DateTo: this.searchDateTo}
        return ret
      },
      urlID () {
        var mID
        if (this.$route.params.MerchantID !== '') {
          this.MerchantID = this.$route.params.MerchantID
          this.$route.params.MerchantID = ''
        }
        mID = this.MerchantID
        if (mID === 1) {
          mID = ''
        }
        var aID
        if (this.$route.params.AccountID !== '') {
          this.AccountID = this.$route.params.AccountID
          this.$route.params.AccountID = ''
        }
        aID = this.AccountID
        if (aID === 1) {
          aID = ''
        }
        var sID
        if (this.$route.params.SettlementID !== '') {
          this.SettlementID = this.$route.params.SettlementID
          this.$route.params.SettlementID = ''
        }
        sID = this.SettlementID
        if (sID === 1) {
          sID = ''
        }
        var ret = {MerchantID: mID, AccountID: aID, SettlementID: sID}
        return ret
      },
      mPages () {
        var ret = (this.$config.get('runtime.mtotalpages'))
        return ret
      }
    },
    methods: {
      getDateRange () {
        const startOfMonth = this.$moment().startOf('month').format('YYYY-MM-DD')
        const todayDate = this.$moment().format('YYYY-MM-DD')
        this.searchDateFrom = startOfMonth
        this.searchDateTo = todayDate
        this.getData()
      },
      getData () {
        Loading.show()
        console.log(this.url)
        axios.post(this.$config.get('auth.api2URL') + '/ListSettlements', this.url).then(response => {
          console.log(response.data.StatusCode)
          this.table = response.data.Settlements
          if (response.data.Pages !== null) {
            this.maxPages = response.data.Pages.TotalPages
          }
          else {
            this.maxPages = 1
          }
          if (this.page > this.maxPages) {
            this.page = this.maxPages
          }
          Loading.hide()
          if (typeof this.SettlementID === 'string') {
            this.viewSettlementDetails()
          }
        }, response => {
          // error callback
          Loading.hide()
        })
        Loading.hide()
      },
      getMerchantData () {
        var mP = this.mPages
        var i = 1
        do {
          var ret = {ListPage: i, ListOrder: 'Name.asc'}
          axios.post(this.$config.get('auth.api2URL') + '/ListMerchants', ret).then(response => {
            var data = response.data.Merchants
            for (var entry in data) {
              this.selectMerchantOptions.push({'label': data[entry].Name, value: data[entry].MerchantID})
            }
          })
          i++
        } while (i <= mP)
      },
      checkAccountDisabled () {
        if (typeof this.MerchantID !== 'string') {
          this.selectAccountDisabled = true
          this.selectAccountOptions.length = 0
        }
        if (typeof this.MerchantID === 'string') {
          this.selectAccountDisabled = false
          this.getAccountData()
        }
      },
      getAccountData () {
        var ret = {MerchantID: this.MerchantID}
        axios.post(this.$config.get('auth.api2URL') + '/ListAccounts', ret).then(response => {
          var data = response.data.Accounts
          this.selectAccountOptions = []
          for (var entry in data) {
            this.selectAccountOptions.push({'label': data[entry].Name, value: data[entry].AccountID})
          }
        })
      },
      viewSettlementDetails () {
        Loading.show()
        console.log(this.url)
        axios.post(this.$config.get('auth.api2URL') + '/GetSettlement', this.urlID).then(response => {
          this.ViewSettlement = response.data.Settlement
          console.log(response.data.StatusCode)
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
        this.$refs.layoutModalShowSettlementsDetails.open()
      },
      getCsv () {
        Loading.show()
        var ret = {MerchantID: this.MerchantID, AccountID: this.AccountID, GetCsv: true}
        axios.post(this.$config.get('auth.api2URL') + '/ListSettlements', ret).then(response => {
          console.log(ret)
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'settlements-data.csv')
          document.body.appendChild(link)
          link.click()
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
      },
      onSort (sortColumn, sortDirection) {
        if (sortDirection === 1) {
          this.sort.dir = 'asc'
        }
        if (sortDirection === -1) {
          this.sort.dir = 'desc'
        }
        this.sort.column = sortColumn
        this.getData()
      },
      setupWatchers () {
        unwatchers = []
        // Must use instance method to watch $refs
        unwatchers.push(this.$watch(
          '$refs.dataTable.sorting',
          sortData => {
            const { field, dir } = sortData
            this.onSort(field, dir)
          },
          {
            deep: true
          }
        ))
      },
      teardownWatchers () {
        if (unwatchers.length) {
          unwatchers.forEach(unwatch => unwatch())
          unwatchers = null
        }
      }
    },
    beforeDestroy () {
      this.teardownWatchers()
    },
    components: {
      QDataTable,
      QField,
      QLayout,
      QInput,
      QCheckbox,
      QSelect,
      QSlider,
      QBtn,
      QIcon,
      QTooltip,
      QCollapsible,
      QPagination,
      QSearch,
      QModal,
      QModalLayout,
      QToolbar,
      QToolbarTitle,
      Loading,
      Alert,
      QDatetime,
      date
    }
  }
</script>

<style lang="stylus">
  .layout-footer { box-shadow: none; }
  @import '~variables'
  $layout-footer-shadow
    $no-shadow
</style>
