module.exports = {
  en: {
    messages: {
      page_title: 'Dashboard',
      Menu_merchant: 'Merchants',
      Menu_account: 'Accounts',
      Menu_transaction: 'Transactions',
      Menu_chargebacks: 'Chargebacks',
      Menu_settlements: 'Settlements',
      merchant_info: 'Merchant Info',
      account_info: 'Account Info',
      transaction_info: 'Transaction Info',
      chargeback_info: 'Chargeback Info',
      settlement_info: 'Settlement Info',
      ShowMore: 'Show More',
      date_from: 'From date',
      date_to: 'To date',
      download_as_csv: 'Download data as CSV',
      download_csv: 'Download Csv',
      error_data: 'Can\'t show data',
      reset_url: 'Reset selection',
      alert_no_chargebacks: 'No chargeback',
      // Merchants
      app_table_title_merchants: 'Merchants List',
      WhitelabelMerchantID: 'Whitelabel merchant ID',
      MerchantID: 'Merchant ID',
      Name: 'Name',
      CompanyName: 'Company name',
      CompanyAddress: 'Company address',
      CompanyContactInfo: 'Contact info',
      AgentID: 'Agent ID',
      ReferenceNumber: 'Rerference number',
      CreatedDate: 'Date of creation',
      Closed: 'Closed',
      merchant_details: 'Merchant Details',
      view_merchant_accounts: 'Merchant Accounts',
      merchant_active: 'Active merchant',
      merchant_closed: 'Closed merchant',
      MerchantClosed: 'Active',
      MerchantClosed_true: 'Merchant is closed',
      MerchantClosed_false: 'Merchant is active',
      MerchantClosedDate: 'Date of closure',
      MerchantClosedReason: 'Reason for closure',
      is_merchant_active: 'Is merchant active',
      all: 'Show all',
      active_merchant: 'Active merchants',
      closed_merchant: 'Closed merchants',
      merchant_select: 'Select merchant',
      // Accounts
      account_details: 'Account Details',
      view_accounts_transactions: 'Account Transactions',
      view_accounts_chargebacks: 'Account Chargebacks',
      view_accounts_settlements: 'Account Settlements',
      app_table_title_accounts: 'Accounts List',
      AccountID: 'Account ID',
      AccountName: 'Account name',
      AccountType: 'Account type',
      AccountType_short: 'Type',
      AccountClosed: 'Active',
      account_active: 'Active account',
      account_closed: 'Closed account',
      AccountCreatedDate: 'Date of account creation',
      AccountProductionDate: 'Date of production certification (start)',
      AccountClosed_true: 'Account is closed',
      AccountClosed_false: 'Active account',
      AccountClosedDate: 'Date of account closure',
      AccountClosedReason: 'Reason for closure',
      is_account_active: 'Is account active',
      active_account: 'Active accounts',
      closed_account: 'Closed accounts',
      // Transactions
      transactions_details: 'Transaction Details',
      view_transaction_chargeback: 'Transaction Chargeback',
      view_transaction_payout_settlement: 'Pay Out Settlement',
      view_transaction_reservation_payout_settlement: 'Reservation Pay Out Settlement',
      app_table_title_transactions: 'Transactions List',
      transaction_successful_true: 'Successful transaction',
      transaction_successful_false: 'Unsuccessful transaction',
      transaction_settled_true: 'Transaction settled',
      transaction_settled_false: 'Transaction not settled',
      transaction_paidOut_true: 'Transaction paid out',
      transaction_paidOut_false: 'Transaction not paid out',
      transaction_reservationPaidOut_true: 'Reservation paid out',
      transaction_reservationPaidOut_false: 'Reservation not paid out',
      TransactionDateTime: 'Transaction PG timestamp',
      TransactionDateTime_short: 'Timestamp',
      TransactionType: 'Transaction type',
      TransactionType_short: 'TR type',
      TransactionSuccessful: 'Successful',
      TransactionSuccessful_short: 'Success',
      TransactionMessage: 'Status message',
      TransactionValue: 'Transaction value',
      TransactionValue_transactions: 'TR value',
      TransactionCurrency: 'Transaction currency',
      CardType: 'Card type',
      CardScheme: 'Card scheme',
      TransactionChannel: 'Transaction channel',
      AcquirerICCost: 'Acquirer interchange cost',
      AcquirerCommision: 'Acquirer commision',
      AcquirerAdditionalCharges: 'Acquirer additional charges',
      AcquirerTotalCosts: 'Acquirer total costs',
      MerchantICCost: 'Merchant interchange cost',
      MerchantCommision: 'Merchant commision',
      MerchantAdditionalCharges: 'Merchant additional charges',
      MerchantTotalCosts: 'Merchant total costs',
      MerchantReference: 'Merchant transaction reference',
      PaymentGatewayReference: 'PG transaction reference',
      Settled: 'Transaction settled',
      SettledDateTime: 'Settlement date',
      PayoutValue: 'Pay out value',
      PayoutDate: 'Pay out date',
      PayoutSettlementID: 'Pay out settlement ID',
      PaidOut: 'Transaction paid out',
      ReservationValue: 'Transaction reservation value',
      ReservationHeldDate: 'Transaction reservation held to date',
      ReservationPayoutDate: 'Transaction reservation pay out date',
      ReservationPayoutSettlementID: 'Transaction reservation settlement ID',
      ReservationPaidOut: 'Transaction reservation paid out',
      show_transactions_from_date: 'Show transactions from &nbsp;&nbsp;',
      // Chargebacks
      app_table_title_chargebacks: 'Chargebacks List',
      chargebacks_details: 'Chargeback Details',
      ChargebackDateTime: 'Date of chargeback',
      ChargebackDateTime_short: 'CB date',
      ChargebackType: 'Chargeback type',
      ChargebackType_short: 'CB type',
      ChargebackAmount: 'Chargebacked amount',
      ChargebackAmount_short: 'Amount',
      ChargebackCurrency: 'Chargeback currency',
      ChargebackStatus: 'Chargeback status',
      ChargebackStatus_short: 'CB status',
      ChargebackDescription: 'Chargeback description',
      TransactionValue_chargebacks: 'Transaction value',
      show_chargebacks_from_date: 'Show chargebacks from &nbsp;&nbsp;',
      show_to_date: 'to &nbsp;&nbsp;',
      // Settlements
      app_table_title_settlements: 'Settlements List',
      show_settlements_from_date: 'Show settled transactions from &nbsp;&nbsp;',
      settlement_details: 'Settlement Details',
      SettlementID: 'Settlement ID',
      SettlementNumber: 'Settlement number',
      SettlementType: 'Type of settlement',
      SettlementType_short: 'Type',
      SettlementDateFrom: 'Settled transactions from date',
      SettlementDateFrom_short: 'From date',
      SettlementDateTo: 'Settled transactions to date',
      SettlementDateTo_short: 'To date',
      TransactionsPaidSum: 'Sum of all paid transactions',
      ReservationsPaidOutSum: 'Sum of all transaction reservations from previous settlements paid out',
      CostsSum: 'Sum of all costs',
      Total: 'Total settlement (paid out amount)'
    }
  }
}
