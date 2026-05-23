<script setup lang="ts">
import { ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import FormShell from '@/components/form/FormShell.vue'
import ConfirmDialog from '@/components/dialog/ConfirmDialog.vue'
import UnsavedChangesDialog from '@/components/dialog/UnsavedChangesDialog.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'

const confirmOpen = ref(false)
const unsavedOpen = ref(false)
const voidOpen = ref(false)

const lastAction = ref('None')
</script>

<template>
  <FormShell>
    <div class="space-y-4">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-950">Modal/Dialog Pattern Demo</h1>
        <p class="mt-1 text-sm text-slate-500">Reusable dialogs (confirm, unsaved changes, void).</p>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap gap-2">
          <BaseButton variant="secondary" @click="confirmOpen = true">Open ConfirmDialog</BaseButton>
          <BaseButton variant="secondary" @click="unsavedOpen = true">Open UnsavedChangesDialog</BaseButton>
          <BaseButton variant="danger" @click="voidOpen = true">Open VoidTransactionDialog</BaseButton>
        </div>

        <p class="mt-4 text-sm text-slate-600">
          Last action: <span class="font-bold text-slate-900">{{ lastAction }}</span>
        </p>
      </div>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="Confirm action"
      message="This is a placeholder confirm dialog."
      confirm-label="Yes"
      cancel-label="No"
      @close="confirmOpen = false"
      @confirm="
        () => {
          lastAction = 'Confirmed'
          confirmOpen = false
        }
      "
    />

    <UnsavedChangesDialog
      :open="unsavedOpen"
      @close="unsavedOpen = false"
      @discard="
        () => {
          lastAction = 'Discarded changes'
          unsavedOpen = false
        }
      "
      @save="
        () => {
          lastAction = 'Saved changes (placeholder)'
          unsavedOpen = false
        }
      "
    />

    <VoidTransactionDialog
      :open="voidOpen"
      transaction-number="JRN.2026.0001"
      @close="voidOpen = false"
      @confirm="
        (payload) => {
          lastAction = `Void confirmed: ${payload.reason}`
          voidOpen = false
        }
      "
    />
  </FormShell>
</template>
