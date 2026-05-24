<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { deliveryOrderFormConfig } from '@/features/sales/forms'
</script>

<template>
  <TransactionWorkspacePage :config="deliveryOrderFormConfig" />
</template>

