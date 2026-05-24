<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { vendorBillFormConfig } from '@/features/purchase/forms'
</script>

<template>
  <TransactionWorkspacePage :config="vendorBillFormConfig" />
</template>

