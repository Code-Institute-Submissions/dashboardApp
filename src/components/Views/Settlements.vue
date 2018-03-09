<template>
  <div class="layout-padding justify-right">
    <p></p>
    
    <div class="row" >
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
          <div class="q-toolbar-title">
            {{ $t("messages.settlement_info") }}
          </div>
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
        AccountID: 1,
        PayoutSettlementID: 1,
        ReservationPayoutSettlementID: 1
      }
    },

    watch: {
      page () {
        this.getData()
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
        var psID
        if (this.$route.params.PayoutSettlementID !== '') {
          this.PayoutSettlementID = this.$route.params.PayoutSettlementID
          this.$route.params.PayoutSettlementID = ''
        }
        psID = this.PayoutSettlementID
        if (psID === 1) {
          psID = ''
        }
        var rpsID
        if (this.$route.params.ReservationPayoutSettlementID !== '') {
          this.ReservationPayoutSettlementID = this.$route.params.ReservationPayoutSettlementID
          this.$route.params.ReservationPayoutSettlementID = ''
        }
        rpsID = this.ReservationPayoutSettlementID
        if (rpsID === 1) {
          rpsID = ''
        }
        var ret = {DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, MerchantID: mID, AccountID: aID, PayoutSettlementID: psID, ReservationPayoutSettlementID: rpsID, ListPage: this.page, ListOrder: ''}
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
          console.log(response.data.StatusCode)
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
      },
      viewSettlementDetails () {
        Loading.show()
        console.log(this.url)
        axios.post(this.$config.get('auth.api2URL') + '/GetSettlement', this.url).then(response => {
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
