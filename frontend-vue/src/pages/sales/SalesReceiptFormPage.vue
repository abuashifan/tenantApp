<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { salesReceiptFormConfig } from '@/features/sales/forms'
</script>

<template>
  <TransactionWorkspacePage :config="salesReceiptFormConfig" />
</template>

