<template>
  <div class="layout-padding justify-right">
    <p></p>
    <q-data-table
      :data="table"
      :config="configs"
      :columns="columns"
      ref="dataTable">
      
      <template slot="col-ShowMore" slot-scope="cell">
        <!-- button to view merchant details -->
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
    </div>
    
    <!-- modal to display merchant data -->
    <q-modal ref="layoutModalShowMerchantDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowMerchantDetails.close()"><q-icon name="clear" /></q-btn>
          <div class="q-toolbar-title">
            Merchant Info
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewMerchant.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="ViewMerchant.WhitelabelMerchantID" v-bind:stack-label="$t('messages.WhitelabelMerchantID')" readonly />
          <q-input v-model="ViewMerchant.Name" v-bind:stack-label="$t('messages.Name')" readonly />
          <q-input v-model="ViewMerchant.CompanyName" v-bind:stack-label="$t('messages.CompanyName')" readonly />
          <q-input v-model="ViewMerchant.CompanyAddress" v-bind:stack-label="$t('messages.CompanyAddress')" type="textarea" :min-rows="1" readonly />
          <q-input v-model="ViewMerchant.CompanyContactInfo" v-bind:stack-label="$t('messages.CompanyContactInfo')" readonly />
          <q-input v-model="ViewMerchant.AgentID" v-bind:stack-label="$t('messages.AgentID')" readonly />
          <q-input v-model="ViewMerchant.ReferenceNumber" v-bind:stack-label="$t('messages.ReferenceNumber')" readonly />
          <q-input v-model="ViewMerchant.CreatedDate" v-bind:stack-label="$t('messages.CreatedDate')" readonly />
          <!-- <q-input v-model="ViewMerchant.Closed" v-bind:stack-label="$t('messages.MerchantClosed')" readonly /> -->
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
    Loading,
    Alert
  } from 'quasar'
  import axios from 'axios'
  var unwatchers = null
  export default {
    mounted () {
      this.setupWatchers()
      this.getData()
      Loading.show()
    },
    data () {
      return {
        table: [],
        page: 1,
        searchData: '',
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '100px' },
          { label: this.$t('messages.Name'), field: 'Name', sort: true, type: 'string', filter: true },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', sort: false, type: 'guid', filter: true },
          { label: this.$t('messages.CompanyName'), field: 'CompanyName', sort: true, type: 'string', filter: true },
          { label: this.$t('messages.CompanyContactInfo'), field: 'CompanyContactInfo', sort: true, type: 'string', filter: true },
          { label: this.$t('messages.MerchantClosed'), field: 'Closed', width: '80px', sort: true, type: 'boolean', filter: true }
        ],
        configs: {
          columnPicker: true,
          title: this.$t('messages.app_table_title_merchants'),
          rowHeight: '50px',
          labels: {
            columns: 'Display columns',
            allCols: 'Search in all columns'
          }
        },
        maxPages: 1,
        ViewMerchant: {},
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
        var ret = {ListPage: this.page, ListOrder: ''}
        if (this.sort.column !== '') {
          ret.ListOrder = this.sort.column + '.' + this.sort.dir
        }
        return ret
      }
    },
    methods: {
      getData () {
        Loading.show()
        // api request on page load, shows all merchants
        axios.post(this.$config.get('auth.api2URL') + '/ListMerchants', this.url).then(response => {
          this.table = response.data.Merchants
          this.maxPages = response.data.Pages.TotalPages
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
      },
      viewMerchant (ID) {
        // button to show merchant data triggers this function
        var index = this.table.findIndex(obj => obj.MerchantID === ID)
        var selectedMerchant = this.table[index]
        this.ViewMerchant = selectedMerchant
        console.log(selectedMerchant)
        // Convert date
        if (this.ViewMerchant.CreatedDate !== null) {
          this.ViewMerchant.CreatedDate = this.$d(this.$moment(this.ViewMerchant.CreatedDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        if (this.ViewMerchant.ClosedDate !== null) {
          this.ViewMerchant.ClosedDate = this.$d(this.$moment(this.ViewMerchant.ClosedDate, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }
        this.$refs.layoutModalShowMerchantDetails.open()
      },
      viewAccounts (ID) {
        this.$router.push({path: '/admin/Accounts/' + ID, param: {MerchantID: ID}})
        return true
      },
      getCsv () {
        var ret = {GetCsv: true}
        axios.post(this.$config.get('auth.api2URL') + '/ListMerchants', ret).then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'merchants-data.csv')
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
