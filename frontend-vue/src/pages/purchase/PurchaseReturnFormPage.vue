<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { purchaseReturnFormConfig } from '@/features/purchase/forms'
</script>

<template>
  <TransactionWorkspacePage :config="purchaseReturnFormConfig" />
</template>

