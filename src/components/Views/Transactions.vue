<template>
  <div class="layout-padding justify-right">
    <p></p>
    
    <div class="row">
      <div class="col-md-2">
        <div class="auto">
          <q-datetime type="date" v-bind:placeholder="$t('messages.date_from')" :debounce="500"
                    v-model.lazy="searchDateFrom" @change="getData"/>
        </div>
      </div>
      <div class="col-md-2">
        <div class="auto">
          <q-datetime type="date" v-bind:placeholder="$t('messages.date_to')" :debounce="500"
                    v-model.lazy="searchDateTo" @change="getData"/>
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
        <q-btn small round flat v-on:click="view(cell.row.ID)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.transactions_details") }}
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
    
    <q-modal ref="layoutModalShowTransactionDetails" :content-css="{minWidth: '40vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowTransactionDetails.close()"><q-icon name="clear" /></q-btn>
          <div class="q-toolbar-title">
            Transaction Info
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewTransaction.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="ViewTransaction.AccountID" v-bind:stack-label="$t('messages.AccountID')" readonly />
          <q-input v-model="ViewTransaction.TransactionType" v-bind:stack-label="$t('messages.TransactionType')" readonly />

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
        searchDateFrom: '2016-01-01',
        searchDateTo: '2017-01-01',
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '80px' },
          { label: this.$t('messages.AccountID'), field: 'AccountID', width: '150px', sort: true, type: 'guid', filter: true },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', width: '150px', sort: true, type: 'guid', filter: true },
          { label: this.$t('messages.TransactionType'), field: 'TransactionType', width: '150px', sort: true, type: 'string', filter: true }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_transactions')
        },
        maxPages: 1,
        Transactions: {},
        ViewTransaction: {
          MerchantID: '',
          AccountID: '',
          TransactionType: ''
        },
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
        /* var ret = {DateFrom: this.searchDateFrom1, DateTo: this.searchDateTo1}
        axios.post(this.$config.get('auth.api2URL') + '/ListTransactions', this.url, ret).then(response => {
        // axios.post(this.$config.get('auth.api2URL') + '/ListTransactions', ret).then(response => {
          this.table = response.data.Transactions
          this.maxPages = response.data.Pages.TotalPages
        }, response => {
          // error callback
        }) */
      },
      view (ID) {
        console.log(ID)
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
