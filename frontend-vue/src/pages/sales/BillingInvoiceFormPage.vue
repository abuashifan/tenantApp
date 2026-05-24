<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { billingInvoiceFormConfig } from '@/features/sales/forms'
</script>

<template>
  <TransactionWorkspacePage :config="billingInvoiceFormConfig" />
</template>

