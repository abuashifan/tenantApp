<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { contactsService } from '@/services/master-data/contacts.service'
import type { ApiResponse } from '@/types/api'
import TransactionSearchableSelect from '@/components/transaction-form/TransactionSearchableSelect.vue'

type Contact = {
  id: number
  contact_code?: string | null
  name: string
  payment_term_id?: number | string | null
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
    compact?: boolean
  }>(),
  {
    label: 'Partner',
    readonly: false,
    compact: false,
  },
)

const emit = defineEmits<{
  select: [contact: Contact]
}>()

const loading = ref(false)
const contacts = ref<Contact[]>([])
const error = ref<string | null>(null)

const filtered = computed(() => {
  const isCustomer = props.partnerType === 'customer'
  return contacts.value.filter((c) => (isCustomer ? c.is_customer : c.is_supplier))
})

const options = computed(() =>
  filtered.value.map((c) => ({
    value: String(c.id),
    label: c.contact_code ? `${c.contact_code} - ${c.name}` : c.name,
    contact: c,
  })),
)

function onSelect(option: unknown) {
  const contact = (option as { contact?: Contact }).contact
  if (contact) emit('select', contact)
}

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
  <TransactionSearchableSelect
    :name="name"
    :label="label"
    :readonly="readonly"
    :loading="loading"
    :error="error"
    placeholder="Search partner…"
    :options="options"
    :compact="compact"
    @select="onSelect"
  />
</template>
