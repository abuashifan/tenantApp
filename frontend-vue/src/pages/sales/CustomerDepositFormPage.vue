<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { customerDepositFormConfig } from '@/features/sales/forms'
</script>

<template>
  <TransactionWorkspacePage :config="customerDepositFormConfig" />
</template>

