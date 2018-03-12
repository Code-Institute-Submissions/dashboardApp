<template>
  <div class="layout-padding justify-right">
    <p></p>
    
    <div class="row">
      <div class="col-md-2">
      </div>
      <div class="col-md-4 " style="margin-top: -10px" v-if="this.$store.getters.getShowTransactions">
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
      <div class="col-md-6 " style="margin-top: -10px" v-if="this.$store.getters.getShowTransactions">
        <div class="auto">
          <q-select
            v-model="MerchantID"
            :options="selectMerchantOptions"
            @change="getData"
            style="width: 100%"
            filter
            v-bind:float-label="$t('messages.merchant_select')"
          />
        </div>
      </div>
    </div>
    
    <div class="row" >
      <div class="col-md-auto">
        <q-field >
          <q-datetime 
            type="date" 
            v-bind:placeholder="$t('messages.date_from')"
            v-bind:prefix="$t('messages.show_chargebacks_from_date')"
            align="center"
            :debounce="500" 
            monday-first
            format="DD.MM.YYYY"
            v-model.lazy="searchDateFrom" 
            @change="getData" />
        </q-field>
      </div>
      
      <div class="col-md-auto" style="padding-left: 3vw;">
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
    </div>
    
    <q-data-table
      :data="table"
      :config="configs"
      :columns="columns"
      ref="dataTable">
      
      <template slot="col-ShowMore" slot-scope="cell">
        <q-btn small round flat v-on:click="viewChargebackDetails(cell.row.ChargebackDateTime)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.chargebacks_details") }}
          </q-tooltip>
        </q-btn>
      </template>
      
      <template slot="col-ChargebackDateTime" slot-scope="cell">
        {{ cell.row.ChargebackDateTime | moment('utc',"DD-MM-YYYY HH:mm:ss") }}
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
    
    <q-modal ref="layoutModalShowChargebackDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowChargebackDetails.close()"><q-icon name="clear" /></q-btn>
          <div class="q-toolbar-title">
            {{ $t("messages.chargeback_info") }}
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewChargeback.ChargebackDateTime" v-bind:stack-label="$t('messages.ChargebackDateTime')" readonly />
          <q-input v-model="ViewChargeback.ChargebackType" v-bind:stack-label="$t('messages.ChargebackType')" readonly />
          <q-input v-model="ViewChargeback.ChargebackAmount" v-bind:stack-label="$t('messages.ChargebackAmount')" readonly />
          <q-input v-model="ViewChargeback.ChargebackCurrency" v-bind:stack-label="$t('messages.ChargebackCurrency')" readonly />
          <q-input v-model="ViewChargeback.AccountID" v-bind:stack-label="$t('messages.AccountID')" readonly />
          <q-input v-model="ViewChargeback.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="ViewChargeback.WhitelabelMerchantID"  v-bind:stack-label="$t('messages.WhitelabelMerchantID')" readonly />
          <q-input v-model="ViewChargeback.TransactionType" v-bind:stack-label="$t('messages.TransactionType')" readonly />
          <q-input v-model="ViewChargeback.TransactionValue"  v-bind:stack-label="$t('messages.TransactionValue_chargebacks')" readonly />
          <q-input v-model="ViewChargeback.TransactionCurrency"  v-bind:stack-label="$t('messages.TransactionCurrency')" readonly />
          <q-input v-model="ViewChargeback.ChargebackStatus"  v-bind:stack-label="$t('messages.ChargebackStatus')" readonly />
          <q-input v-model="ViewChargeback.ChargebackDescription"  v-bind:stack-label="$t('messages.ChargebackDescription')" readonly />

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
          { label: this.$t('messages.ChargebackDateTime_short'), field: 'ChargebackDateTime', sort: true, type: 'date' },
          { label: this.$t('messages.ChargebackType_short'), field: 'ChargebackType', sort: true, type: 'string' },
          { label: this.$t('messages.ChargebackAmount_short'), field: 'ChargebackAmount', sort: true, type: 'number' },
          /* { label: this.$t('messages.AccountID'), field: 'AccountID', sort: false, type: 'guid' }, */
          { label: this.$t('messages.ChargebackStatus_short'), field: 'ChargebackStatus', sort: true, type: 'number' },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', sort: false, type: 'string' }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_chargebacks'),
          rowHeight: '50px',
          bodyStyle: {
            maxHeight: '66vh'
          }
        },
        maxPages: 1,
        ViewChargeback: {},
        sort: {
          column: 'Name',
          dir: 'asc'
        },
        MerchantID: 1,
        selectMerchantOptions: [],
        AccountID: 1,
        selectAccountOptions: [],
        selectAccountDisabled: false,
        PaymentGatewayReference: 1
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
        var pgRef
        if (this.$route.params.PaymentGatewayReference !== '') {
          this.PaymentGatewayReference = this.$route.params.PaymentGatewayReference
          this.$route.params.PaymentGatewayReference = ''
        }
        pgRef = this.PaymentGatewayReference
        if (pgRef === 1) {
          pgRef = ''
        }
        var ret = {MerchantID: mID, AccountID: aID, PaymentGatewayReference: pgRef, DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, ListPage: this.page, ListOrder: ''}
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
        axios.post(this.$config.get('auth.api2URL') + '/ListChargebacks', this.url).then(response => {
          this.table = response.data.Chargebacks
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
        }, response => {
          // error callback
          Loading.hide()
        })
      },
      getMerchantData () {
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
        } while (i < 10)
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
      viewChargebackDetails (ID) {
        var index = this.table.findIndex(obj => obj.ChargebackDateTime === ID)
        var selectedChargeback = this.table[index]
        this.ViewChargeback = selectedChargeback
        console.log(selectedChargeback)
        // Convert date
        if (this.ViewChargeback.ChargebackDateTime !== null) {
          this.ViewChargeback.ChargebackDateTime = this.$d(this.$moment(this.ViewChargeback.ChargebackDateTime, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }

        this.$refs.layoutModalShowChargebackDetails.open()
      },
      getCsv () {
        Loading.show()
        var ret = {DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, GetCsv: true}
        axios.post(this.$config.get('auth.api2URL') + '/ListChargebacks', ret).then(response => {
          console.log(ret)
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'chargebacks-data.csv')
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
