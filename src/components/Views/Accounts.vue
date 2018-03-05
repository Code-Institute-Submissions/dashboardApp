<template>
  <div class="layout-padding justify-right">
    <p></p>
    <q-data-table
      :data="table"
      :config="configs"
      :columns="columns"
      ref="dataTable">
      
      <template slot="col-ShowMore" slot-scope="cell">
        <q-btn small round flat v-on:click="viewAccount(cell.row.AccountID)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.account_details") }}
          </q-tooltip>
        </q-btn>
        <q-btn small round flat v-on:click="viewTransactions(cell.row.AccountID)"  color="primary"><q-icon name="forward" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.view_accounts_transactions") }}
          </q-tooltip>
        </q-btn>
      </template>
      
      <!-- <template slot="col-Closed" slot-scope="cell">
        <q-icon v-if="cell.row.Closed" color="red-9" name="clear" />
        <q-icon v-if="!cell.row.Closed" color="green-9" name="done" />
      </template> -->
      
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
    <div class="auto">
      <q-pagination
        v-model="page"
        :max=maxPages
      >
      </q-pagination>
      <q-btn small round flat v-on:click="resetUrl()" v-show="showResetButton"><q-icon name="update" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.reset_url") }}
          </q-tooltip>
      </q-btn>
      
      <!-- <div class="float-right" style="padding-top: 10px" >
        <q-btn icon-right="get app" color="green" no-caps rounded v-on:click="getCsv()">
          {{ $t("messages.download_as_csv") }}
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.download_csv") }}
          </q-tooltip>
        </q-btn>
      </div> -->
      <div class="float-right" >
        {{ $t("messages.download_as_csv") }}
        <q-btn round flat v-on:click="getCsv()"><q-icon name="get app" color="green" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.download_csv") }}
          </q-tooltip>
        </q-btn>
      </div>
    </div>
    
    <q-modal ref="layoutModalShowAccountDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowAccountDetails.close()"><q-icon name="clear" /></q-btn>
          <div class="q-toolbar-title">
            {{ $t("messages.account_info") }}
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewAccount.AccountID" v-bind:stack-label="$t('messages.AccountID')" readonly />
          <q-input v-model="ViewAccount.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="ViewAccount.WhitelabelMerchantID"  v-bind:stack-label="$t('messages.WhitelabelMerchantID')" readonly />
          <q-input v-model="ViewAccount.Name" v-bind:stack-label="$t('messages.AccountName')" readonly />
          <q-input v-model="ViewAccount.Type" v-bind:stack-label="$t('messages.AccountType')" readonly />
          <!-- <q-input v-model="ViewAccount.Closed" v-bind:stack-label="$t('messages.Closed')" readonly /> -->
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
    Loading,
    Alert
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
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '100px' },
          { label: this.$t('messages.AccountName'), field: 'Name', sort: true, type: 'string' },
          { label: this.$t('messages.AccountID'), field: 'AccountID', sort: false, type: 'guid' },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', sort: false, type: 'guid' },
          { label: this.$t('messages.AccountType_short'), field: 'Type', width: '80px', sort: true, type: 'string' },
          { label: this.$t('messages.AccountClosed'), field: 'Closed', width: '80px', sort: true, type: 'boolean' }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_accounts'),
          rowHeight: '50px',
          bodyStyle: {
            maxHeight: '66vh'
          }
        },
        maxPages: 1,
        ViewAccount: {},
        MerchantID: 1,
        sort: {
          column: 'Name',
          dir: 'asc'
        },
        showResetButton: false
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
        var ret = {ListPage: this.page, ListOrder: '', MerchantID: mID}
        // Sort by name or not ?
        /* if (this.sort.column !== '') {
          ret.ListOrder = this.sort.column + '.' + this.sort.dir
        } */
        return ret
      }
    },
    methods: {
      getData () {
        Loading.show()
        axios.post(this.$config.get('auth.api2URL') + '/ListAccounts', this.url).then(response => {
          this.table = response.data.Accounts
          // Fix error if there is no data to show
          if (response.data.Pages !== null) {
            this.maxPages = response.data.Pages.TotalPages
          }
          else {
            this.maxPages = 1
          }
          if (this.page > this.maxPages) {
            this.page = this.maxPages
          }
          // Show reset button
          if (response.data.Pages.TotalPages === 1) {
            this.showResetButton = true
          }
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
      },
      viewAccount (ID) {
        var index = this.table.findIndex(obj => obj.AccountID === ID)
        var selectedAccount = this.table[index]
        this.ViewAccount = selectedAccount
        console.log(selectedAccount)
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
      viewTransactions (ID) {
        this.$router.push({path: '/admin/Transactions/' + ID, param: {AccountID: ID}})
        return true
      },
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
      resetUrl () {
        this.$router.push({path: '/admin/Accounts'})
        this.getData()
        this.showResetButton = false
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
