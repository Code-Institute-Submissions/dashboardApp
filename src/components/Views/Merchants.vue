<template>
  <div class="layout-padding justify-right">
    <p></p>
    <q-data-table
      :data="table"
      :config="configs"
      :columns="columns"
      ref="dataTable">
      
      <template slot="col-ShowMore" slot-scope="cell">
        <q-btn small round flat v-on:click="view(cell.row.ID)"><q-icon name="zoom in" />
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 15]">
            {{ $t("messages.merchant_details") }}
          </q-tooltip>
        </q-btn>
      </template>

    </q-data-table>
    <div class="auto">
      <q-pagination
        v-model="page"
        :max=maxPages
      ></q-pagination>
    </div>
    
    <q-modal ref="layoutModalShowMerchantDetails" :content-css="{minWidth: '40vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn color="white" class="on-right"  no-caps flat @click="$refs.layoutModalShowMerchantDetails.close()"><q-icon name="clear" /></q-btn>
          <div class="q-toolbar-title">
            Merchant Info
          </div>
        </q-toolbar>
        <div class="layout-padding">
          <q-input v-model="Merchants.WhitelabelMerchantID" v-bind:stack-label="$t('messages.WhitelabelMerchantID')" readonly />
          <q-input v-model="Merchants.MerchantID"  v-bind:stack-label="$t('messages.MerchantID')" readonly />
          <q-input v-model="Merchants.Name" v-bind:stack-label="$t('messages.Name')" readonly />
          <q-input v-model="Merchants.CompanyName" v-bind:stack-label="$t('messages.CompanyName')" readonly />
          <q-input v-model="Merchants.CompanyAddress" v-bind:stack-label="$t('messages.CompanyAddress')" readonly />

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
    clone,
    QPagination,
    QSearch,
    QModal,
    QModalLayout,
    QToolbar
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
          { label: this.$t('messages.ShowMore'), field: 'ShowMore', sort: false, width: '80px' },
          { label: this.$t('messages.WhitelabelMerchantID'), field: 'WhitelabelMerchantID', width: '150px', sort: true, type: 'string', filter: true },
          { label: this.$t('messages.MerchantID'), field: 'MerchantID', width: '150px', sort: true, type: 'guid', filter: true },
          { label: this.$t('messages.Name'), field: 'Name', width: '150px', sort: true, type: 'string', filter: true }
        ],
        configs: {
          columnPicker: false,
          title: this.$t('messages.app_table_title_merchants')
        },
        maxPages: 1,
        Merchants: {
          WhitelabelMerchantID: '',
          MerchantID: '',
          Name: '',
          CompanyName: '',
          CompanyAddress: ''
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
        var ret = {ListPage: this.page, ListOrder: ''}
        if (this.sort.column !== '') {
          ret.ListOrder = this.sort.column + '.' + this.sort.dir
        }
        return ret
      }
    },
    methods: {
      getData () {
        axios.post(this.$config.get('auth.api2URL') + '/ListMerchants', this.url).then(response => {
          this.table = response.data.Merchants
          this.maxPages = response.data.Pages.TotalPages
          this.Merchants.WhitelabelMerchantID = response.data.Merchants.WhitelabelMerchantID
          this.Merchants.MerchantID = response.data.Merchants.MerchantID
          this.Merchants.Name = response.data.Merchants.Name
          this.Merchants.CompanyName = response.data.Merchants.CompanyName
          this.Merchants.CompanyAddress = response.data.Merchants.CompanyAddress
        }, response => {
          // error callback
        })
      },
      view (ID) {
        this.MerchantID = ID
        this.$refs.layoutModalShowMerchantDetails.open()
        return true
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
      clone,
      QPagination,
      QSearch,
      QModal,
      QModalLayout,
      QToolbar
    }
  }
</script>

<style lang="stylus">
  .layout-footer { box-shadow: none; }
  @import '~variables'
  $layout-footer-shadow
    $no-shadow
</style>
