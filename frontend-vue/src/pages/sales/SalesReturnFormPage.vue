<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { salesReturnFormConfig } from '@/features/sales/forms'
</script>

<template>
  <TransactionWorkspacePage :config="salesReturnFormConfig" />
</template>

