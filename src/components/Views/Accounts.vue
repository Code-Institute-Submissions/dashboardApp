<template>
  <div class="layout-padding justify-right">
    <p></p>
    
    <!-- Customized filters for DataTable -->
    <div class="row">
      <div class="col-md-3">
        <div class="auto">
          <q-search v-bind:placeholder="$t('messages.AccountName')" :debounce="500"
                    v-model.lazy="searchName1" @input="getData" />
        </div>
      </div>
      <div class="col-md-3" style="margin-top: -10px">
        <div class="auto">
          <q-select
            v-model="selectAccountType"
            :options="selectAccountTypeOptions"
            @change="getData"
            style="width: 100%"
            v-bind:float-label="$t('messages.AccountType')"
          />
        </div>
    </div>
      <div class="col-md-3" style="margin-top: -10px">
        <div class="auto">
          <q-select
            v-model="selectType"
            :options="selectTypeOptions"
            @change="getData"
            style="width: 100%"
            v-bind:float-label="$t('messages.is_account_active')"
          />
        </div>
    </div>
      <div class="col-md-3" style="margin-top: -10px; padding-left: 2vw;" v-if="this.$store.getters.getShowAccounts">
        <div class="auto">
          <q-select
            v-model="MerchantID"
            :options="selectMerchantOptions"
            @input="getData"
            style="width: 100%"
            filter
            filter-placeholder="Search..."
            v-bind:float-label="$t('messages.merchant_select')"
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
        <q-btn small round flat v-on:click="viewAccount(cell.row.AccountID)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.account_details") }}
          </q-tooltip>
        </q-btn>
        <q-btn small round flat v-on:click="viewTransactions(cell.row.MerchantID, cell.row.AccountID)"  color="primary"><q-icon name="forward" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.view_accounts_transactions") }}
          </q-tooltip>
        </q-btn>
        <q-btn small round flat v-on:click="viewChargebacks(cell.row.MerchantID, cell.row.AccountID)"  color="primary"><q-icon name="forward" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.view_accounts_chargebacks") }}
          </q-tooltip>
        </q-btn>
        <q-btn small round flat v-on:click="viewSettlements(cell.row.MerchantID, cell.row.AccountID)"  color="primary"><q-icon name="forward" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.view_accounts_settlements") }}
          </q-tooltip>
        </q-btn>
      </template>
      
      <template slot="col-Closed" slot-scope="cell">
        <q-btn v-if="cell.row.Closed" small round flat><q-icon color="red-9" name="clear" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.account_closed") }}
          </q-tooltip>
        </q-btn>
        <q-btn v-if="!cell.row.Closed" small round flat><q-icon color="green-9" name="done" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.account_active") }}
          </q-tooltip>
        </q-btn>
      </template>

    </q-data-table>
    
    <!-- Pagination for DataTable, reset filters button, download all data as CSV button -->
    <div class="auto">
      <q-pagination
        v-model="page"
        :max=maxPages
      >
      </q-pagination>
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
    <q-modal ref="layoutModalShowAccountDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowAccountDetails.close()"><q-icon name="clear" /></q-btn>
          <q-toolbar-title>
            {{ $t("messages.account_info") }}
          </q-toolbar-title>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewAccount.AccountID" v-bind:stack-label="$t('messages.AccountID')" readonly />
          <q-input v-model="ViewAccount.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="ViewAccount.WhitelabelMerchantID"  v-bind:stack-label="$t('messages.WhitelabelMerchantID')" readonly />
          <q-input v-model="ViewAccount.Name" v-bind:stack-label="$t('messages.AccountName')" readonly />
          <q-input v-model="ViewAccount.Type" v-bind:stack-label="$t('messages.AccountType')" readonly />
          <q-input v-model="ViewAccount.CreatedDate" v-bind:stack-label="$t('messages.AccountCreatedDate')" readonly />
          <q-input v-model="ViewAccount.ProductionDate" v-bind:stack-label="$t('messages.AccountProductionDate')" readonly />
          
          <q-field icon="clear" v-if="ViewAccount.Closed" v-bind:label="$t('messages.AccountClosed_true')" :label-width="11" readonly >
          </q-field>
          <q-field icon="done" v-if="!ViewAccount.Closed" v-bind:label="$t('messages.AccountClosed_false')" :label-width="11" readonly >
          </q-field>

          <q-input v-if="ViewAccount.Closed" v-model="ViewAccount.ClosedDate" v-bind:stack-label="$t('messages.AccountClosedDate')" readonly />
          <q-input v-if="ViewAccount.Closed" v-model="ViewAccount.ClosedReason" v-bind:stack-label="$t('messages.AccountClosedReason')" readonly />

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
    Alert
  } from 'quasar'
  import axios from 'axios'
  var unwatchers = null
  export default {
    mounted () {
      // Call fuctions on page load
      this.setupWatchers()
      this.getData()
      this.getMerchantData()
    },
    data () {
      return {
        table: [],
        // DataTable columns and configuration
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '200px' },
          { label: this.$t('messages.AccountName'), field: 'Name', sort: true, type: 'string' },
          { label: this.$t('messages.AccountID'), field: 'AccountID', sort: false, type: 'guid' },
          { label: this.$t('messages.AccountsMerchantName'), field: 'MerchantName', sort: true, type: 'string' },
          { label: this.$t('messages.AccountType_short'), field: 'Type', width: '80px', sort: true, type: 'string' },
          { label: this.$t('messages.AccountClosed'), field: 'Closed', width: '80px', type: 'boolean' }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_accounts'),
          rowHeight: '50px',
          bodyStyle: {
            maxHeight: '66vh'
          }
        },
        sort: {
          column: 'Name',
          dir: ''
        },
        // Set initial values
        page: 1,
        maxPages: 1,
        searchData: '',
        searchName1: '',
        ViewAccount: {},
        showResetButton: true,
        MerchantID: 1,
        selectMerchantOptions: [],
        // Dropdown for selection "active/closed merchant"
        selectType: 0,
        selectTypeOptions: [
          { 'label': this.$t('messages.all'), 'value': 0 },
          { 'label': this.$t('messages.active_account'), 'value': 1 },
          { 'label': this.$t('messages.closed_account'), 'value': 2 }
        ],
        // Dropdown for selection "account type"
        selectAccountType: 0,
        selectAccountTypeOptions: [
          { 'label': this.$t('messages.all'), 'value': 0 },
          { 'label': this.$t('messages.accountTypeEcom'), 'value': 'ECOM' },
          { 'label': this.$t('messages.accountTypePos'), 'value': 'POS' }
        ]
      }
    },
    watch: {
      // Watch for changes to call this functions
      page () {
        this.getData()
      }
    },
    computed: {
      // Get parameters for ListAccounts request
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
        var ret = {ListPage: this.page, ListOrder: '', MerchantID: mID}
        if (this.searchName !== '') {
          ret.Name = this.searchName
        }
        if (this.selectType !== '') {
          ret.Type = this.selectType
        }
        if (this.selectAccountType !== 0) {
          ret.AccountType = this.selectAccountType
        }
        if (this.sort.column !== '') {
          ret.ListOrder = this.sort.column + '.' + this.sort.dir
        }
        return ret
      },
      searchName () {
        return this.searchName1 ? `${this.searchName1}` : ''
      }
    },
    methods: {
      // ListAccounts request, response, set data for table and maxPages
      getData () {
        Loading.show()
        axios.post(this.$config.get('auth.api2URL') + '/ListAccounts', this.url).then(response => {
          this.table = response.data.Accounts
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
      // Get list of all merchants for dropdown menu
      getMerchantData () {
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
          Loading.hide()
        })
      },
      // Show detailed account data in modal, "zoom in" button
      viewAccount (ID) {
        var index = this.table.findIndex(obj => obj.AccountID === ID)
        var selectedAccount = this.table[index]
        this.ViewAccount = selectedAccount
        // Convert date
        if (this.ViewAccount.CreatedDate !== null) {
          this.ViewAccount.CreatedDate = this.$d(this.$moment(this.ViewAccount.CreatedDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewAccount.ProductionDate !== null) {
          this.ViewAccount.ProductionDate = this.$d(this.$moment(this.ViewAccount.ProductionDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewAccount.ClosedDate !== null) {
          this.ViewAccount.ClosedDate = this.$d(this.$moment(this.ViewAccount.ClosedDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        this.$refs.layoutModalShowAccountDetails.open()
      },
      // Redirect to account transactions, "forward" button
      viewTransactions (MerchantID, AccountID) {
        this.$router.push({name: 'Transactions', params: {MerchantID: MerchantID, AccountID: AccountID}})
        return true
      },
      // Redirect to account chargebacks, "forward" button
      viewChargebacks (MerchantID, AccountID) {
        this.$router.push({name: 'Chargebacks', params: {MerchantID: MerchantID, AccountID: AccountID}})
        return true
      },
      // Redirect to account settlements, "forward" button
      viewSettlements (MerchantID, AccountID) {
        this.$router.push({name: 'Settlements', params: {MerchantID: MerchantID, AccountID: AccountID}})
        return true
      },
      // Download all data from ListAccounts response in CSV format
      getCsv () {
        Loading.show()
        var ret = {GetCsv: true}
        axios.post(this.$config.get('auth.api2URL') + '/ListAccounts', ret).then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'accounts-data.csv')
          document.body.appendChild(link)
          link.click()
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
      },
      // Reset filters
      resetFilters () {
        this.MerchantID = 1
        this.searchName1 = ''
        this.selectType = 0
        this.selectAccountType = 0
        this.getData()
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
      Alert
    }
  }
</script>

<style lang="stylus">
  .layout-footer { box-shadow: none; }
  @import '~variables'
  $layout-footer-shadow
    $no-shadow
</style>
