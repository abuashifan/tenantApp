<script setup lang="ts">
import TransactionWorkspacePage from '@/features/transaction-form/TransactionWorkspacePage.vue'
import { goodsReceiptFormConfig } from '@/features/purchase/forms'
</script>

<template>
  <TransactionWorkspacePage :config="goodsReceiptFormConfig" />
</template>

