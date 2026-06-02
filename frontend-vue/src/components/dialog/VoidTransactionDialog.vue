<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseModal from '@/components/dialog/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  open: boolean
  transactionNumber: string
  loading?: boolean
  actionLabel?: string
  requiresReason?: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [payload: { reason: string }]
}>()

const reason = ref('')

watch(
  () => props.open,
  (open) => {
    if (open) reason.value = ''
  },
)

const actionText = computed(() => props.actionLabel ?? 'Void')
const reasonRequired = computed(() => props.requiresReason ?? true)
const canConfirm = computed(() => !reasonRequired.value || reason.value.trim().length > 0)
</script>

<template>
  <BaseModal :open="open" :title="`${actionText} Transaction`" @close="emit('close')">
    <p class="text-sm leading-6 text-slate-600">
      {{ actionText }} transaksi <span class="font-bold text-slate-800">{{ transactionNumber }}</span>.
    </p>

    <label class="mt-4 block space-y-1.5">
      <span class="text-xs font-bold text-slate-500">Reason</span>
      <textarea
        v-model="reason"
        rows="3"
        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        :placeholder="`Masukkan alasan ${actionText.toLowerCase()}...`"
      />
      <p v-if="!canConfirm" class="text-xs font-semibold text-rose-600">Reason wajib diisi.</p>
    </label>

    <div class="mt-6 flex flex-wrap items-center justify-end gap-2">
      <BaseButton variant="secondary" :disabled="loading" @click="emit('close')">Cancel</BaseButton>
      <BaseButton variant="danger" :disabled="!canConfirm" :loading="loading" @click="emit('confirm', { reason: reason.trim() })">
        Confirm {{ actionText }}
      </BaseButton>
    </div>
  </BaseModal>
</template>
