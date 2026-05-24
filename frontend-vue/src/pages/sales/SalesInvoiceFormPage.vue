<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { salesInvoiceFormConfig } from '@/features/sales/forms'
</script>

<template>
  <TransactionWorkspacePage :config="salesInvoiceFormConfig" />
</template>

