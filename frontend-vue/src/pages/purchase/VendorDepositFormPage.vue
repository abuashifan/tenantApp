<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { vendorDepositFormConfig } from '@/features/purchase/forms'
</script>

<template>
  <TransactionWorkspacePage :config="vendorDepositFormConfig" />
</template>

