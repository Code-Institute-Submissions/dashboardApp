<template>
  <div class="layout-padding justify-right">
    <p></p>
    
    <!-- Customized filters for DataTable -->
    <div class="row">
      <div class="col-md-3">
        <div class="auto">
          <q-search v-bind:placeholder="$t('messages.MerchantName')" :debounce="500"
                    v-model.lazy="searchName1" @input="getData" />
        </div>
      </div>
      <div class="col-md-3">
        <div class="auto">
          <q-search v-bind:placeholder="$t('messages.CompanyName')" :debounce="500"
                    v-model.lazy="searchCompanyName1" @input="getData" />
        </div>
      </div>
      <div class="col-md-3 " style="margin-top: -10px">
        <div class="auto">
          <q-select
            v-model="selectType"
            :options="selectTypeOptions"
            @change="getData"
            style="width: 100%"
            v-bind:float-label="$t('messages.is_merchant_active')"
          />
        </div>
      <div class="col-md-auto"></div>
     </div>
    </div>
    
    <q-data-table
      :data="table"
      :config="configs"
      :columns="columns"
      ref="dataTable">
      
      <!-- Customized columns for DataTable -->
      <template slot="col-ShowMore" slot-scope="cell">
        <q-btn small round flat v-on:click="viewMerchant(cell.row.MerchantID)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.merchant_details") }}
          </q-tooltip>
        </q-btn>
        <q-btn small round flat v-on:click="viewAccounts(cell.row.MerchantID)"  color="primary"><q-icon name="forward" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.view_merchant_accounts") }}
          </q-tooltip>
        </q-btn>
      </template>
      
      <template slot="col-Closed" slot-scope="cell">
        <q-btn v-if="cell.row.Closed" small round flat><q-icon color="red-9" name="clear" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.merchant_closed") }}
          </q-tooltip>
        </q-btn>
        <q-btn v-if="!cell.row.Closed" small round flat><q-icon color="green-9" name="done" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.merchant_active") }}
          </q-tooltip>
        </q-btn>
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
    <q-modal ref="layoutModalShowMerchantDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowMerchantDetails.close()"><q-icon name="clear" /></q-btn>
          <q-toolbar-title>
            {{ $t("messages.merchant_info") }}
          </q-toolbar-title>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewMerchant.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="ViewMerchant.WhitelabelMerchantID" v-bind:stack-label="$t('messages.WhitelabelMerchantID')" readonly />
          <q-input v-model="ViewMerchant.Name" v-bind:stack-label="$t('messages.MerchantName')" readonly />
          <q-input v-model="ViewMerchant.CompanyName" v-bind:stack-label="$t('messages.CompanyName')" readonly />
          <q-input v-model="ViewMerchant.CompanyAddress" v-bind:stack-label="$t('messages.CompanyAddress')" type="textarea" :min-rows="1" readonly />
          <q-input v-model="ViewMerchant.CompanyContactInfo" v-bind:stack-label="$t('messages.CompanyContactInfo')" readonly />
          <q-input v-model="ViewMerchant.AgentID" v-bind:stack-label="$t('messages.AgentID')" readonly />
          <q-input v-model="ViewMerchant.ReferenceNumber" v-bind:stack-label="$t('messages.ReferenceNumber')" readonly />
          <q-input v-model="ViewMerchant.CreatedDate" v-bind:stack-label="$t('messages.CreatedDate')" readonly />
          <q-field icon="clear" v-if="ViewMerchant.Closed" v-bind:label="$t('messages.MerchantClosed_true')" :label-width="11" readonly >
          </q-field>
          <q-field icon="done" v-if="!ViewMerchant.Closed" v-bind:label="$t('messages.MerchantClosed_false')" :label-width="11" readonly >
          </q-field>
          <q-input v-if="ViewMerchant.Closed" v-model="ViewMerchant.ClosedDate" v-bind:stack-label="$t('messages.MerchantClosedDate')" readonly />
          <q-input v-if="ViewMerchant.Closed" v-model="ViewMerchant.ClosedReason" v-bind:stack-label="$t('messages.MerchantClosedReason')" readonly />

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
    Dialog
  } from 'quasar'
  import axios from 'axios'
  var unwatchers = null
  export default {
    mounted () {
      // Call fuctions on page load
      this.setupWatchers()
      this.getData()
    },
    data () {
      return {
        table: [],
        // DataTable columns and configuration
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '100px' },
          { label: this.$t('messages.MerchantName'), field: 'Name', sort: true, type: 'string' },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', sort: false, type: 'guid' },
          { label: this.$t('messages.CompanyName'), field: 'CompanyName', sort: true, type: 'string' },
          { label: this.$t('messages.CompanyContactInfo'), field: 'CompanyContactInfo', type: 'string' },
          { label: this.$t('messages.MerchantClosed'), field: 'Closed', width: '80px', type: 'boolean' }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_merchants'),
          rowHeight: '50px',
          bodyStyle: {
            maxHeight: '66vh'
          }
        },
        // Set initial values
        page: 1,
        maxPages: 1,
        searchData: '',
        searchName1: '',
        searchCompanyName1: '',
        showResetButton: true,
        MerchantID: 1,
        ViewMerchant: {},
        // Dropdown for selection active/closed merchant
        selectType: 0,
        selectTypeOptions: [
          { 'label': this.$t('messages.all'), 'value': 0 },
          { 'label': this.$t('messages.active_merchant'), 'value': 1 },
          { 'label': this.$t('messages.closed_merchant'), 'value': 2 }
        ],
        sort: {
          column: 'Name',
          dir: 'asc'
        }
      }
    },

    watch: {
      // Watch for changes to call this functions
      page () {
        this.getData()
      }
    },
    computed: {
      // Get parameters for ListMerchants request
      url () {
        var ret = {ListPage: this.page, ListOrder: ''}
        if (this.searchName !== '') {
          ret.Name = this.searchName
        }
        if (this.searchCompanyName !== '') {
          ret.CompanyName = this.searchCompanyName
        }
        if (this.selectType !== '') {
          ret.Type = this.selectType
        }
        if (this.sort.column !== '') {
          ret.ListOrder = this.sort.column + '.' + this.sort.dir
        }
        return ret
      },
      searchName () {
        return this.searchName1 ? `${this.searchName1}` : ''
      },
      searchCompanyName () {
        return this.searchCompanyName1 ? `${this.searchCompanyName1}` : ''
      }
    },
    methods: {
      // ListMerchants request, response, set data for table and maxPages
      getData () {
        Loading.show()
        axios.post(this.$config.get('auth.api2URL') + '/ListMerchants', this.url).then(response => {
          this.table = response.data.Merchants
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
      // Show detailed merchant data in modal, "zoom in" button
      viewMerchant (ID) {
        var index = this.table.findIndex(obj => obj.MerchantID === ID)
        var selectedMerchant = this.table[index]
        this.ViewMerchant = selectedMerchant
        // Convert date
        if (this.ViewMerchant.CreatedDate !== null) {
          this.ViewMerchant.CreatedDate = this.$d(this.$moment(this.ViewMerchant.CreatedDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewMerchant.ClosedDate !== null) {
          this.ViewMerchant.ClosedDate = this.$d(this.$moment(this.ViewMerchant.ClosedDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        this.$refs.layoutModalShowMerchantDetails.open()
      },
      // Redirect to merchant accounts, "forward" button
      viewAccounts (MerchantID) {
        this.$router.push({name: 'Accounts', params: {MerchantID: MerchantID}})
        return true
      },
      // Download all data from ListMerchants response in CSV format
      getCsv () {
        Loading.show()
        var ret = {GetCsv: true}
        axios.post(this.$config.get('auth.api2URL') + '/ListMerchants', ret).then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'merchants-data.csv')
          document.body.appendChild(link)
          link.click()
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
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
      // Reset filters
      resetFilters () {
        this.MerchantID = 1
        this.searchName1 = ''
        this.searchCompanyName1 = ''
        this.selectType = 0
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
      Dialog
    }
  }
</script>

<style lang="stylus">
  .layout-footer { box-shadow: none; }
  @import '~variables'
  $layout-footer-shadow
    $no-shadow
</style>
