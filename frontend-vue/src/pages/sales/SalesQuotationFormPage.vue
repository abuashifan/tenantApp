<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { salesQuotationFormConfig } from '@/features/sales/forms'
</script>

<template>
  <TransactionWorkspacePage :config="salesQuotationFormConfig" />
</template>

