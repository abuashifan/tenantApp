<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { purchaseRequestFormConfig } from '@/features/purchase/forms'
</script>

<template>
  <TransactionWorkspacePage :config="purchaseRequestFormConfig" />
</template>

