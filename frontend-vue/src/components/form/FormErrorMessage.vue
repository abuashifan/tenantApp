<script setup lang="ts">
import { ErrorMessage } from 'vee-validate'

defineProps<{
  name: string
}>()
</script>

<template>
  <ErrorMessage :name="name" v-slot="{ message }">
    <p class="text-xs font-semibold text-rose-600">{{ message }}</p>
  </ErrorMessage>
</template>
