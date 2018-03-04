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
        <q-btn small round flat v-on:click="viewChargebackDetails(cell.row.ChargebackDateTime)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.chargebacks_details") }}
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
      
      <!-- <div class="float-right" style="padding-top: 10px" >
        <q-btn icon-right="get app" color="green" no-caps rounded v-on:click="getCsv()">
          {{ $t("messages.download_as_csv") }}
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.download_csv") }}
          </q-tooltip>
        </q-btn>
      </div> -->
        
    </div>
    
    <q-modal ref="layoutModalShowChargebackDetails" :content-css="{minWidth: '45vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowChargebackDetails.close()"><q-icon name="clear" /></q-btn>
          <div class="q-toolbar-title">
            Chargeback Info
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="ViewChargeback.ChargebackDateTime" v-bind:stack-label="$t('messages.ChargebackDateTime')" readonly />
          <q-input v-model="ViewChargeback.ChargebackType" v-bind:stack-label="$t('messages.ChargebackType')" readonly />
          <q-input v-model="ViewChargeback.ChargebackAmount" v-bind:stack-label="$t('messages.ChargebackAmount')" readonly />
          <q-input v-model="ViewChargeback.ChargebackCurrency" v-bind:stack-label="$t('messages.ChargebackCurrency')" readonly />
          <q-input v-model="ViewChargeback.AccountID" v-bind:stack-label="$t('messages.AccountID')" readonly />
          <q-input v-model="ViewChargeback.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="ViewChargeback.WhitelabelMerchantID"  v-bind:stack-label="$t('messages.WhitelabelMerchantID')" readonly />
          <q-input v-model="ViewChargeback.TransactionType" v-bind:stack-label="$t('messages.TransactionType')" readonly />
          <q-input v-model="ViewChargeback.TransactionValue"  v-bind:stack-label="$t('messages.TransactionValue_chargebacks')" readonly />
          <q-input v-model="ViewChargeback.TransactionCurrency"  v-bind:stack-label="$t('messages.TransactionCurrency')" readonly />
          <q-input v-model="ViewChargeback.ChargebackStatus"  v-bind:stack-label="$t('messages.ChargebackStatus')" readonly />
          <q-input v-model="ViewChargeback.ChargebackDescription"  v-bind:stack-label="$t('messages.ChargebackDescription')" readonly />

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
        searchDateTo: '2018-03-01',
        columns: [
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '100px' },
          { label: this.$t('messages.ChargebackDateTime_short'), field: 'ChargebackDateTime', sort: true, type: 'date' },
          { label: this.$t('messages.ChargebackType_short'), field: 'ChargebackType', sort: true, type: 'string' },
          { label: this.$t('messages.ChargebackAmount_short'), field: 'ChargebackAmount', sort: true, type: 'number' },
          /* { label: this.$t('messages.AccountID'), field: 'AccountID', sort: false, type: 'guid' }, */
          { label: this.$t('messages.ChargebackStatus_short'), field: 'ChargebackStatus', sort: true, type: 'number' },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', sort: false, type: 'string' }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_chargebacks'),
          rowHeight: '50px',
          bodyStyle: {
            maxHeight: '66vh'
          }
        },
        maxPages: 1,
        ViewChargeback: {},
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
        Loading.show()
        axios.post(this.$config.get('auth.api2URL') + '/ListChargebacks', this.url).then(response => {
          this.table = response.data.Chargebacks
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
          Loading.hide()
        }, response => {
          // error callback
          Loading.hide()
        })
      },
      viewChargebackDetails (ID) {
        var index = this.table.findIndex(obj => obj.ChargebackDateTime === ID)
        var selectedChargeback = this.table[index]
        this.ViewChargeback = selectedChargeback
        console.log(selectedChargeback)
        // Convert date
        if (this.ViewChargeback.ChargebackDateTime !== null) {
          this.ViewChargeback.ChargebackDateTime = this.$d(this.$moment(this.ViewChargeback.ChargebackDateTime, 'YYYY-MM-DD HH:mm:ss').local(), 'long')
        }

        this.$refs.layoutModalShowChargebackDetails.open()
      },
      getCsv () {
        Loading.show()
        var ret = {DateFrom: this.searchDateFrom, DateTo: this.searchDateTo, GetCsv: true}
        axios.post(this.$config.get('auth.api2URL') + '/ListChargebacks', ret).then(response => {
          console.log(ret)
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'chargebacks-data.csv')
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
