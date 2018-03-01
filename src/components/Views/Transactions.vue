<template>
  <div class="layout-padding justify-right">
    <p></p>
    
    <div class="row">
      <div class="col-md-2">
        <div class="auto">
          <q-datetime type="date" v-bind:placeholder="$t('messages.date_from')" :debounce="500" v-model.lazy="searchDateFrom" @change="getData" />     
        </div>
      </div>
      <div class="col-md-3">
        <div class="auto">
            <q-field icon="date range" >
              <q-datetime type="date" v-bind:placeholder="$t('messages.date_to')" :debounce="500" v-model.lazy="searchDateTo" @change="getData"/>
          </q-field>
        </div>
      </div>
      <div class="col-md-auto"></div>
    </div>
    
    <q-data-table
      :data="table"
      :config="configs"
      :columns="columns"
      ref="dataTable">
      
      <template slot="col-ShowMore" slot-scope="cell">
        <q-btn small round flat v-on:click="viewTransactionDetails(cell.row.ID)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.transactions_details") }}
          </q-tooltip>
        </q-btn>
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
      <q-btn small round flat v-on:click="getCsv()"><q-icon name="get app" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.download_csv") }}
          </q-tooltip>
        </q-btn>
        <!-- Temporary code -->
        <q-btn small round flat v-on:click="$refs.layoutModalShowTransactionDetails.open()"><q-icon name="zoom in" />
        </q-btn>
        <!-- Temporary code -->
    </div>
    
    <q-modal ref="layoutModalShowTransactionDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowTransactionDetails.close()"><q-icon name="clear" /></q-btn>
          <div class="q-toolbar-title">
            Transaction Info
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewTransaction.TransactionDateTime" v-bind:stack-label="$t('messages.TransactionDateTime')" readonly />
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
    QDatetime
  } from 'quasar'
  import axios from 'axios'
  var unwatchers = null
  export default {
    mounted () {
      this.setupWatchers()
      this.getData()
    },
    data () {
      return {
        table: [],
        page: 1,
        searchData: '',
        searchDateFrom: '2015-01-01',
        searchDateTo: '2018-01-01',
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '100px' },
          { label: this.$t('messages.TransactionDateTime_short'), field: 'TransactionDateTime', sort: true, type: 'date', filter: true },
          { label: this.$t('messages.TransactionValue_transactions'), field: 'TransactionValue', sort: true, type: 'number', filter: true },
          /* { label: this.$t('messages.AccountID'), field: 'AccountID', sort: false, type: 'guid', filter: true },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', sort: false, type: 'string', filter: true }, */
          { label: this.$t('messages.TransactionSuccessful_short'), field: 'TransactionSuccessful', sort: true, type: 'boolean', filter: true },
          { label: this.$t('messages.TransactionType_short'), field: 'TransactionType', sort: true, type: 'string', filter: true },
          { label: this.$t('messages.CardType'), field: 'CardType', sort: true, type: 'string', filter: true }
        ],
        configs: {
          columnPicker: true,
          title: this.$t('messages.app_table_title_transactions'),
          rowHeight: '50px',
          labels: {
            columns: 'Display columns',
            allCols: 'Search in all columns'
          }
        },
        maxPages: 1,
        ViewTransaction: {},
        sort: {
          column: 'Name',
          dir: 'asc'
        }
      }
    },

    watch: {
      page () {
        this.getData()
      }
    },
    computed: {
      url () {
        var ret = {DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, ListPage: this.page, ListOrder: ''}
        if (this.searchDateFrom !== '') {
          ret.DateFrom = this.searchDateFrom
        }
        if (this.searchDateTo !== '') {
          ret.DateTo = this.searchDateTo
        }
        return ret
      }
    },
    methods: {
      getData () {
        // var ret = {DateFrom: this.searchDateFrom1, DateTo: this.searchDateTo1}
        axios.post(this.$config.get('auth.api2URL') + '/ListTransactions', this.url).then(response => {
        // axios.post(this.$config.get('auth.api2URL') + '/ListTransactions', ret).then(response => {
          this.table = response.data.Transactions
          // this.maxPages = response.data.Pages.TotalPages
          console.log(response.data.StatusCode)
        }, response => {
          // error callback
        })
      },
      ViewTransactionDetails (ID) {
        console.log(ID)
        // Convert date
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
      getCsv () {
        var ret = {DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, GetCsv: true}
        axios.post(this.$config.get('auth.api2URL') + '/ListTransactions', ret).then(response => {
          console.log(ret)
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'transactions-data.csv')
          document.body.appendChild(link)
          link.click()
        }, response => {
          // error callback
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
      QDatetime
    }
  }
</script>

<style lang="stylus">
  .layout-footer { box-shadow: none; }
  @import '~variables'
  $layout-footer-shadow
    $no-shadow
</style>
