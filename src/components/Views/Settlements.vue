<template>
  <div class="layout-padding justify-right">
    <p></p>
    
    <!-- Customized filters for DataTable -->
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
      <div class="col-md-3" style="margin-top: -10px">
        <div class="auto">
          <q-select
            v-model="selectSettlementType"
            :options="selectSettlementTypeOptions"
            @change="getData"
            style="width: 100%"
            v-bind:float-label="$t('messages.selectSettlementType')"
          />
        </div>
      </div>
    </div>
    
    <q-data-table
      :data="table"
      :config="configs"
      :columns="columns"
      ref="dataTable">
      
      <!-- Customized columns for DataTable -->
      <template slot="col-ShowMore" slot-scope="cell">
        <q-btn small round flat v-on:click="viewSettlementDetails(cell.row.SettlementID)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.settlement_details") }}
          </q-tooltip>
        </q-btn>
      </template>
      
      <template slot="col-SettlementDateFrom" slot-scope="cell">
        {{ cell.row.SettlementDateFrom | moment("YYYY-MM-DD") }}
      </template>
      <template slot="col-SettlementDateTo" slot-scope="cell">
        {{ cell.row.SettlementDateTo | moment("YYYY-MM-DD") }}
      </template>
      
    </q-data-table>
    
    <!-- Pagination for DataTable, reset filters button, download all data as CSV button -->
    <div class="auto">
      <q-pagination
        v-model="page"
        :max=maxPages
      ></q-pagination>
      <q-btn small round flat v-on:click="resetFilters()" v-show="showResetButton"><q-icon name="update" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.reset_filters") }}
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
    
    <!-- Modal to display details, all data from API response -->
    <q-modal ref="layoutModalShowSettlementDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowSettlementDetails.close()"><q-icon name="clear" /></q-btn>
          <q-toolbar-title>
            {{ $t("messages.settlement_info") }}
          </q-toolbar-title>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewSettlement.SettlementID" v-bind:stack-label="$t('messages.SettlementID')" readonly />
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
      // Call fuctions on page load
      this.setupWatchers()
      this.getDateRange()
      this.getMerchantData()
      this.getSettlementTypes()
    },
    data () {
      return {
        table: [],
        // DataTable columns and configuration
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '100px' },
          { label: this.$t('messages.SettlementID'), field: 'SettlementID', sort: false, type: 'string' },
          { label: this.$t('messages.SettlementNumber'), field: 'SettlementNumber', sort: true, type: 'string' },
          { label: this.$t('messages.SettlementType_short'), field: 'SettlementType', sort: false, type: 'string' },
          { label: this.$t('messages.SettlementDateFrom_short'), field: 'SettlementDateFrom', sort: true, type: 'date' },
          { label: this.$t('messages.SettlementDateTo_short'), field: 'SettlementDateTo', sort: true, type: 'date' },
          { label: this.$t('messages.SettlementTotal_short'), field: 'Total', sort: true, type: 'number' }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_settlements'),
          rowHeight: '50px',
          bodyStyle: {
            maxHeight: '66vh'
          }
        },
        sort: {
          column: 'Name',
          dir: 'asc'
        },
        // Set initial values
        page: 1,
        maxPages: 1,
        searchData: '',
        searchDateFrom: '',
        searchDateTo: '',
        showResetButton: true,
        ViewSettlement: {},
        MerchantID: 1,
        selectMerchantOptions: [],
        AccountID: 1,
        selectAccountOptions: [],
        selectAccountDisabled: false,
        selectSettlementType: '',
        selectSettlementTypeOptions: []
      }
    },

    watch: {
      // Watch for changes to call this functions
      page () {
        this.getData()
      },
      MerchantID () {
        this.getData()
        this.checkAccountDisabled()
      }
    },
    computed: {
      // Get parameters for Listettlements request
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
        var ret = {MerchantID: mID, AccountID: aID, DateFrom: this.searchDateFrom, DateTo: this.searchDateTo}
        if (this.selectSettlementType !== '') {
          ret.SettlementType = this.selectSettlementType
        }
        return ret
      }
    },
    methods: {
      // Date range filter with initial values
      getDateRange () {
        const startOfMonth = this.$moment().startOf('month').format('YYYY-MM-DD')
        const todayDate = this.$moment().format('YYYY-MM-DD')
        this.searchDateFrom = startOfMonth
        this.searchDateTo = todayDate
        this.getData()
      },
      // ListSettlements request, response, set data for table and maxPages
      getData () {
        Loading.show()
        console.log(this.url)
        axios.post(this.$config.get('auth.api2URL') + '/ListSettlements', this.url).then(response => {
          console.log(response.data.StatusCode)
          this.table = response.data.Settlements
          /* if (response.data.StatusCode === -1) {
            Alert.create({html: 'Error: Select merchant and account'})
          } */
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
        })
      },
      getMerchantData () {
        // Get list of all merchants for dropdown menu
        Loading.show()
        var ret = {Type: 1}
        axios.post(this.$config.get('auth.api2URL') + '/ListMerchantsDashboard', ret).then(response => {
          var merchantsList = response.data.Merchants
          for (var entry in merchantsList) {
            this.selectMerchantOptions.push({label: merchantsList[entry].Name, value: merchantsList[entry].MerchantID})
          }
          Loading.hide()
        }, response => {
          // error callback
        })
      },
      getSettlementTypes () {
        // Get settlement types for dropdown menu
        axios.post(this.$config.get('auth.api2URL') + '/ListSettlementTypes').then(response => {
          var typesList = response.data.SettlementTypes
          console.log(typesList)
          for (var entry in typesList) {
            this.selectSettlementTypeOptions.push({label: typesList[entry].Description, value: typesList[entry].ID})
          }
        }, response => {
          // error callback
        })
      },
      // Disable account selection if no merchant is selected
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
      // Get accounts for selected merchant
      getAccountData () {
        var ret = {MerchantID: this.MerchantID}
        axios.post(this.$config.get('auth.api2URL') + '/ListAccounts', ret).then(response => {
          var data = response.data.Accounts
          this.selectAccountOptions = []
          for (var entry in data) {
            this.selectAccountOptions.push({label: data[entry].Name, value: data[entry].AccountID})
          }
        })
      },
      // Show detailed settlement data in modal, "zoom in" button
      viewSettlementDetails (ID) {
        var index = this.table.findIndex(obj => obj.SettlementID === ID)
        var selectedSettlement = this.table[index]
        this.ViewSettlement = selectedSettlement
        if (this.ViewSettlement.SettlementDateFrom !== null) {
          this.ViewSettlement.SettlementDateFrom = this.$d(this.$moment(this.ViewSettlement.SettlementDateFrom, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewSettlement.SettlementDateTo !== null) {
          this.ViewSettlement.SettlementDateTo = this.$d(this.$moment(this.ViewSettlement.SettlementDateTo, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        this.$refs.layoutModalShowSettlementDetails.open()
      },
      // Download all data from ListSettlements response in CSV format
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
        Loading.hide()
      },
      // Reset filters
      resetFilters () {
        this.MerchantID = 1
        this.AccountID = 1
        this.selectAccountOptions = []
        this.selectAccountDisabled = true
        this.selectSettlementType = ''
        this.getDateRange()
      },
      // General table sorting
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
