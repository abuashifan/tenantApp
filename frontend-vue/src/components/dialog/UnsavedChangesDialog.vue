<script setup lang="ts">
import BaseModal from '@/components/dialog/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  save: []
  discard: []
}>()
</script>

<template>
  <BaseModal :open="open" title="Perubahan belum disimpan" @close="emit('close')">
    <p class="text-sm leading-6 text-slate-600">
      Ada perubahan yang belum disimpan. Apa yang ingin Anda lakukan?
    </p>

    <div class="mt-6 flex flex-wrap items-center justify-end gap-2">
      <BaseButton variant="secondary" @click="emit('close')">Batal</BaseButton>
      <BaseButton variant="secondary" @click="emit('discard')">Jangan Simpan</BaseButton>
      <BaseButton variant="primary" @click="emit('save')">Simpan</BaseButton>
    </div>
  </BaseModal>
</template>
