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
            v-bind:prefix="$t('messages.show_transactions_from_date')"
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
        <q-btn small round flat v-on:click="viewTransactionDetails(cell.row.TransactionDateTime)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.transactions_details") }}
          </q-tooltip>
        </q-btn>
        <q-btn small round flat v-on:click="viewTransactionChargeback(cell.row.MerchantID, cell.row.AccountID, cell.row.PaymentGatewayReference, cell.row.ChargebackStatus)"  color="primary"><q-icon name="forward" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.view_transaction_chargeback") }}
          </q-tooltip>
        </q-btn>
        <q-btn small round flat v-on:click="viewSettlementPayoutID(cell.row.MerchantID, cell.row.AccountID, cell.row.PayoutSettlementID)"  color="primary"><q-icon name="forward" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.view_transaction_payout_settlement") }}
          </q-tooltip>
        </q-btn>
        <q-btn small round flat v-on:click="viewSettlementReservationPayoutID(cell.row.MerchantID, cell.row.AccountID, cell.row.ReservationPayoutSettlementID)"  color="primary"><q-icon name="forward" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.view_transaction_reservation_payout_settlement") }}
          </q-tooltip>
        </q-btn>
      </template>

      <template slot="col-TransactionDateTime" slot-scope="cell">
        {{ cell.row.TransactionDateTime | moment('utc',"YYYY-MM-DD HH:mm:ss") }}
      </template>
      
      <template slot="col-TransactionSuccessful" slot-scope="cell">
        <q-btn v-if="cell.row.TransactionSuccessful" small round flat><q-icon color="green-9" name="done" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.transaction_successful_true") }}
          </q-tooltip>
        </q-btn>
        <q-btn v-if="!cell.row.TransactionSuccessful" small round flat><q-icon color="red-9" name="clear" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.transaction_successful_false") }}
          </q-tooltip>
        </q-btn>
      </template>
      
    </q-data-table>
    <div class="auto">
      <q-pagination
        v-model="page"
        :max=maxPages
      ></q-pagination>
      <q-btn small round flat v-on:click="resetUrl()" v-show="showResetButton"><q-icon name="update" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.reset_url") }}
          </q-tooltip>
      </q-btn>
      <div class="float-right" >
        {{ $t("messages.download_as_csv") }}
        <q-btn round flat v-on:click="getCsv()"><q-icon name="get app" color="green" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.download_csv") }}
          </q-tooltip>
        </q-btn>
      </div>

    </div>
    
    <q-modal ref="layoutModalShowTransactionDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowTransactionDetails.close()"><q-icon name="clear" /></q-btn>
          <div class="q-toolbar-title">
            {{ $t("messages.transaction_info") }}
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewTransaction.TransactionDateTime" v-bind:stack-label="$t('messages.TransactionDateTime')" readonly />
          <q-datetime 
            type="datetime" 
            format="DD-MM-YYYY HH:mm:ss"
            v-model="ViewTransaction.TransactionDateTime"
            v-bind:stack-label="$t('messages.TransactionDateTime')"
            disable
             />
        
          <q-input v-model="ViewTransaction.AccountID" v-bind:stack-label="$t('messages.AccountID')" readonly />
          <q-input v-model="ViewTransaction.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="ViewTransaction.WhitelabelMerchantID"  v-bind:stack-label="$t('messages.WhitelabelMerchantID')" readonly />
          <q-input v-model="ViewTransaction.TransactionType" v-bind:stack-label="$t('messages.TransactionType')" readonly />
          <!-- <q-input v-model="ViewTransaction.TransactionSuccessful" v-bind:stack-label="$t('messages.TransactionSuccessful')" readonly /> -->
          <q-field icon="done" v-if="ViewTransaction.TransactionSuccessful" v-bind:label="$t('messages.transaction_successful_true')" :label-width="11" readonly >
          </q-field>
          <q-field icon="clear" v-if="!ViewTransaction.TransactionSuccessful" v-bind:label="$t('messages.transaction_successful_false')" :label-width="11" readonly >
          </q-field>
          <q-input v-model="ViewTransaction.TransactionMessage" v-bind:stack-label="$t('messages.TransactionMessage')" readonly />
          <q-input v-model="ViewTransaction.TransactionValue" v-bind:stack-label="$t('messages.TransactionValue')" readonly />
          <q-input v-model="ViewTransaction.TransactionCurrency" v-bind:stack-label="$t('messages.TransactionCurrency')" readonly />
          <q-input v-model="ViewTransaction.CardType" v-bind:stack-label="$t('messages.CardType')" readonly />
          <q-input v-model="ViewTransaction.CardScheme" v-bind:stack-label="$t('messages.CardScheme')" readonly />
          <q-input v-model="ViewTransaction.TransactionChannel" v-bind:stack-label="$t('messages.TransactionChannel')" readonly />
          <q-input v-model="ViewTransaction.AcquirerICCost" v-bind:stack-label="$t('messages.AcquirerICCost')" readonly />
          <q-input v-model="ViewTransaction.AcquirerCommision" v-bind:stack-label="$t('messages.AcquirerCommision')" readonly />
          <q-input v-model="ViewTransaction.AcquirerAdditionalCharges" v-bind:stack-label="$t('messages.AcquirerAdditionalCharges')" readonly />
          <q-input v-model="ViewTransaction.AcquirerTotalCosts" v-bind:stack-label="$t('messages.AcquirerTotalCosts')" readonly />
          <q-input v-model="ViewTransaction.MerchantICCost" v-bind:stack-label="$t('messages.MerchantICCost')" readonly />
          <q-input v-model="ViewTransaction.MerchantCommision" v-bind:stack-label="$t('messages.MerchantCommision')" readonly />
          <q-input v-model="ViewTransaction.MerchantAdditionalCharges" v-bind:stack-label="$t('messages.MerchantAdditionalCharges')" readonly />
          <q-input v-model="ViewTransaction.MerchantTotalCosts" v-bind:stack-label="$t('messages.MerchantTotalCosts')" readonly />
          <q-input v-model="ViewTransaction.MerchantReference" v-bind:stack-label="$t('messages.MerchantReference')" readonly />
          <q-input v-model="ViewTransaction.PaymentGatewayReference" v-bind:stack-label="$t('messages.PaymentGatewayReference')" readonly />
          <!-- <q-input v-model="ViewTransaction.Settled" v-bind:stack-label="$t('messages.Settled')" readonly /> -->
          <q-field icon="done" v-if="ViewTransaction.Settled" v-bind:label="$t('messages.transaction_settled_true')" :label-width="11" readonly >
          </q-field>
          <q-field icon="clear" v-if="!ViewTransaction.Settled" v-bind:label="$t('messages.transaction_settled_false')" :label-width="11" readonly >
          </q-field>
          <q-input v-model="ViewTransaction.SettledDateTime" v-bind:stack-label="$t('messages.SettledDateTime')" readonly />
          <q-input v-model="ViewTransaction.PayoutValue" v-bind:stack-label="$t('messages.PayoutValue')" readonly />
          <q-input v-model="ViewTransaction.PayoutDate" v-bind:stack-label="$t('messages.PayoutDate')" readonly />
          <q-input v-model="ViewTransaction.PayoutSettlementID" v-bind:stack-label="$t('messages.PayoutSettlementID')" readonly />
          <!-- <q-input v-model="ViewTransaction.PaidOut" v-bind:stack-label="$t('messages.PaidOut')" readonly /> -->
          <q-field icon="done" v-if="ViewTransaction.PaidOut" v-bind:label="$t('messages.transaction_paidOut_true')" :label-width="11" readonly >
          </q-field>
          <q-field icon="clear" v-if="!ViewTransaction.PaidOut" v-bind:label="$t('messages.transaction_paidOut_false')" :label-width="11" readonly >
          </q-field>
          <q-input v-model="ViewTransaction.ReservationValue" v-bind:stack-label="$t('messages.ReservationValue')" readonly />
          <q-input v-model="ViewTransaction.ReservationHeldDate" v-bind:stack-label="$t('messages.ReservationHeldDate')" readonly />
          <q-input v-model="ViewTransaction.ReservationPayoutDate" v-bind:stack-label="$t('messages.ReservationPayoutDate')" readonly />
          <q-input v-model="ViewTransaction.ReservationPayoutSettlementID" v-bind:stack-label="$t('messages.ReservationPayoutSettlementID')" readonly />
          <!-- <q-input v-model="ViewTransaction.ReservationPaidOut" v-bind:stack-label="$t('messages.ReservationPaidOut')" readonly /> -->
          <q-field icon="done" v-if="ViewTransaction.ReservationPaidOut" v-bind:label="$t('messages.transaction_reservationPaidOut_true')" :label-width="11" readonly >
          </q-field>
          <q-field icon="clear" v-if="!ViewTransaction.ReservationPaidOut" v-bind:label="$t('messages.transaction_reservationPaidOut_false')" :label-width="11" readonly >
          </q-field>
          <q-input v-model="ViewTransaction.ChargebackStatus" v-bind:stack-label="$t('messages.ChargebackStatus')" readonly />
          <q-input v-model="ViewTransaction.ChargebackDescription" v-bind:stack-label="$t('messages.ChargebackDescription')" readonly />

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
    date,
    Toast
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
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '200px' },
          { label: this.$t('messages.TransactionDateTime_short'), field: 'TransactionDateTime', sort: true, type: 'date' },
          { label: this.$t('messages.TransactionValue_transactions'), field: 'TransactionValue', sort: true, type: 'number' },
          /* { label: this.$t('messages.AccountID'), field: 'AccountID', sort: false, type: 'guid' },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', sort: false, type: 'string' }, */
          { label: this.$t('messages.TransactionSuccessful_short'), field: 'TransactionSuccessful', sort: true, type: 'boolean' },
          { label: this.$t('messages.TransactionType_short'), field: 'TransactionType', sort: true, type: 'string' },
          { label: this.$t('messages.ChargebackStatus'), field: 'ChargebackStatus', sort: true, type: 'number' }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_transactions'),
          rowHeight: '50px',
          bodyStyle: {
            maxHeight: '66vh'
          }
        },
        maxPages: 1,
        ViewTransaction: {},
        sort: {
          column: 'Name',
          dir: 'asc'
        },
        showResetButton: true,
        MerchantID: 1,
        selectMerchantOptions: [],
        AccountID: 1,
        selectAccountOptions: [],
        selectAccountDisabled: false
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
        var ret = {DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, MerchantID: mID, AccountID: aID, ListPage: this.page, ListOrder: ''}
        if (this.sort.column !== '') {
          ret.ListOrder = this.sort.column + '.' + this.sort.dir
        }
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
        axios.post(this.$config.get('auth.api2URL') + '/ListTransactions', this.url).then(response => {
          this.table = response.data.Transactions
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
        Loading.hide()
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
      viewTransactionDetails (ID) {
        var index = this.table.findIndex(obj => obj.TransactionDateTime === ID)
        var selectedTransaction = this.table[index]
        this.ViewTransaction = selectedTransaction
        // Convert date
        /* if (this.ViewTransaction.TransactionDateTime !== null) {
          this.ViewTransaction.TransactionDateTime = this.$d(this.$moment(this.ViewTransaction.TransactionDateTime, 'YYYY-DD-MM HH:mm:ss').local(), 'long')
        }
        if (this.ViewTransaction.SettledDateTime !== null) {
          this.ViewTransaction.SettledDateTime = this.$d(this.$moment(this.ViewTransaction.SettledDateTime, 'YYYY-DD-MM HH:mm:ss').local(), 'long')
        }
        if (this.ViewTransaction.PayoutDate !== null) {
          this.ViewTransaction.PayoutDate = this.$d(this.$moment(this.ViewTransaction.PayoutDate, 'YYYY-DD-MM HH:mm:ss').local(), 'long')
        }
        if (this.ViewTransaction.ReservationHeldDate !== null) {
          this.ViewTransaction.ReservationHeldDate = this.$d(this.$moment(this.ViewTransaction.ReservationHeldDate, 'YYYY-DD-MM HH:mm:ss').local(), 'long')
        }
        if (this.ViewTransaction.ReservationPayoutDate !== null) {
          this.ViewTransaction.ReservationPayoutDate = this.$d(this.$moment(this.ViewTransaction.ReservationPayoutDate, 'YYYY-DD-MM HH:mm:ss').local(), 'long')
        } */
        if (this.ViewTransaction.TransactionDateTime !== null) {
          this.ViewTransaction.TransactionDateTime = this.$d(this.$moment(this.ViewTransaction.TransactionDateTime, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewTransaction.SettledDateTime !== null) {
          this.ViewTransaction.SettledDateTime = this.$d(this.$moment(this.ViewTransaction.SettledDateTime, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewTransaction.PayoutDate !== null) {
          this.ViewTransaction.PayoutDate = this.$d(this.$moment(this.ViewTransaction.PayoutDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewTransaction.ReservationHeldDate !== null) {
          this.ViewTransaction.ReservationHeldDate = this.$d(this.$moment(this.ViewTransaction.ReservationHeldDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewTransaction.ReservationPayoutDate !== null) {
          this.ViewTransaction.ReservationPayoutDate = this.$d(this.$moment(this.ViewTransaction.ReservationPayoutDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }

        this.$refs.layoutModalShowTransactionDetails.open()
      },
      viewTransactionChargeback (MerchantID, AccountID, PaymentGatewayReference, ChargebackStatus) {
        /* if (ChargebackStatus > 0) { */
        this.$router.push({name: 'Chargebacks', params: {MerchantID: MerchantID, AccountID: AccountID, PaymentGatewayReference: PaymentGatewayReference}})
        return true
        /* }
        else {
          Toast.create({color: 'orange', html: this.$t('messages.alert_no_chargebacks'), icon: 'report_problem'})
        } */
      },
      viewSettlementPayoutID (MerchantID, AccountID, PayoutSettlementID) {
        this.$router.push({name: 'SettlementID', params: {MerchantID: MerchantID, AccountID: AccountID, SettlementID: PayoutSettlementID}})
        return true
      },
      viewSettlementReservationPayoutID (MerchantID, AccountID, ReservationPayoutSettlementID) {
        this.$router.push({name: 'SettlementID', params: {MerchantID: MerchantID, AccountID: AccountID, SettlementID: ReservationPayoutSettlementID}})
        return true
      },
      getCsv () {
        Loading.show()
        var ret = {DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, GetCsv: true}
        axios.post(this.$config.get('auth.api2URL') + '/ListTransactions', ret).then(response => {
          console.log(ret)
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'transactions-data.csv')
          document.body.appendChild(link)
          link.click()
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
      },
      resetUrl () {
        this.$router.push({path: '/admin/Transactions'})
        this.MerchantID = 1
        this.AccountID = 1
        this.selectAccountOptions = []
        this.selectAccountDisabled = true
        this.getDateRange()
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
      date,
      Toast
    }
  }
</script>

<style lang="stylus">
  .layout-footer { box-shadow: none; }
  @import '~variables'
  $layout-footer-shadow
    $no-shadow
</style>
