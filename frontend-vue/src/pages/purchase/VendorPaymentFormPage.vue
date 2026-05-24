<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { vendorPaymentFormConfig } from '@/features/purchase/forms'
</script>

<template>
  <TransactionWorkspacePage :config="vendorPaymentFormConfig" />
</template>

