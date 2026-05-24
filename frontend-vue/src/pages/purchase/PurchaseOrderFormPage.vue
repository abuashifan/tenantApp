<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { purchaseOrderFormConfig } from '@/features/purchase/forms'
</script>

<template>
  <TransactionWorkspacePage :config="purchaseOrderFormConfig" />
</template>

