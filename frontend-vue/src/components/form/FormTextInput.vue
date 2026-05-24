<script setup lang="ts">
import FormInput from '@/components/form/FormInput.vue'

defineProps<{
  name: string
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  readonly?: boolean
}>()
</script>

<template>
  <FormInput
    :name="name"
    :label="label"
    :placeholder="placeholder"
    :type="type"
    :disabled="disabled"
    :readonly="readonly"
  />
</template>
