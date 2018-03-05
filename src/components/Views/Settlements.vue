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
        <q-btn small round flat v-on:click="viewSettlementDetails(cell.row.ID)"><q-icon name="zoom in" />
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
        searchMerchantID1: '5f4d3bc7-8d88-47c7-8a8e-f6bbe414c2e5',
        searchAccountID1: '08b6374f-5555-4ca1-9d3d-cf1211ef3202',
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '100px' },
          { label: this.$t('messages.SettlementID'), field: 'SettlementID', sort: false, type: 'string' },
          { label: this.$t('messages.SettlementNumber'), field: 'SettlementNumber', sort: true, type: 'string' },
          { label: this.$t('messages.SettlementType'), field: 'SettlementType', sort: false, type: 'guid' },
          { label: this.$t('messages.SettlementDateFrom'), field: 'SettlementDateFrom', sort: true, type: 'date' },
          { label: this.$t('messages.SettlementDateTo'), field: 'SettlementDateTo', sort: true, type: 'boolean' }
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
        var ret = {MerchantID: this.MerchantID1, AccountID: this.AccountID1, DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, ListPage: this.page, ListOrder: ''}
        if (this.searchDateFrom !== '') {
          ret.DateFrom = this.searchDateFrom
        }
        if (this.searchDateTo !== '') {
          ret.DateTo = this.searchDateTo
        }
        if (this.searchMerchantID !== '') {
          ret.MerchantID = this.searchMerchantID
        }
        if (this.searchAccountID !== '') {
          ret.AccountID = this.searchAccountID
        }
        return ret
      },
      searchMerchantID () {
        return this.searchMerchantID1 ? `${this.searchMerchantID1}` : ''
      },
      searchAccountID () {
        return this.searchAccountID1 ? `${this.searchAccountID1}` : ''
      }
    },
    methods: {
      getDateRange () {
        const startOfMonth = this.$moment().startOf('month').format('YYYY-MM-DD')
        const todayDate = this.$moment().format('YYYY-MM-DD')
        this.searchDateFrom = startOfMonth
        this.searchDateTo = todayDate
        console.log(this.searchDateFrom)
        console.log(this.searchDateTo)
        this.getData()
      },
      getData () {
        Loading.show()
        axios.post(this.$config.get('auth.api2URL') + '/ListSettlements', this.url).then(response => {
          this.table = response.data.Settlements
          if (response.data.Pages !== null) {
            this.maxPages = response.data.Pages.TotalPages
          }
          else {
            // this.maxPages = 1
            console.log('SOME ERROR')
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
      viewSettlementsDetails (ID) {
        this.$refs.layoutModalShowSettlementsDetails.open()
      },
      getCsv () {
        Loading.show()
        var ret = {MerchantID: this.MerchantID1, AccountID: this.AccountID1, GetCsv: true}
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
