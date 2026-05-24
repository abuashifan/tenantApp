<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Field, useField } from 'vee-validate'

import { contactsService } from '@/services/master-data/contacts.service'
import type { ApiResponse } from '@/types/api'

type Contact = {
  id: number
  contact_code?: string | null
  name: string
  is_customer?: boolean
  is_supplier?: boolean
  is_active?: boolean
}

const props = withDefaults(
  defineProps<{
    partnerType: 'customer' | 'vendor'
    name: string
    label?: string
    readonly?: boolean
  }>(),
  {
    label: 'Partner',
    readonly: false,
  },
)

const { value } = useField<string | number>(() => props.name)
const loading = ref(false)
const contacts = ref<Contact[]>([])
const error = ref<string | null>(null)

const filtered = computed(() => {
  const isCustomer = props.partnerType === 'customer'
  return contacts.value.filter((c) => (isCustomer ? c.is_customer : c.is_supplier))
})

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    const res = await contactsService.list({ is_active: true })
    const payload = res.data as ApiResponse<Contact[]>
    contacts.value = Array.isArray(payload.data) ? payload.data : []
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load partners.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <label class="block space-y-1.5">
    <span class="text-xs font-bold text-slate-500">{{ label }}</span>
    <Field
      :name="name"
      as="select"
      :disabled="readonly || loading"
      class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:bg-slate-50"
    >
      <option value="" disabled>Select…</option>
      <option v-for="c in filtered" :key="c.id" :value="String(c.id)">
        {{ c.contact_code ? `${c.contact_code} - ${c.name}` : c.name }}
      </option>
    </Field>
    <p v-if="error" class="text-xs font-semibold text-rose-700">{{ error }}</p>
    <p v-else-if="!readonly && value && loading" class="text-xs font-semibold text-slate-500">Loading…</p>
  </label>
</template>
