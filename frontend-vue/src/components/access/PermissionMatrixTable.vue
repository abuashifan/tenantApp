<script setup lang="ts">
import PermissionCheckbox from '@/components/access/PermissionCheckbox.vue'
import type { PermissionCatalogFeature } from '@/services/access/permissions.service'

const props = defineProps<{
  columns: string[]
  features: PermissionCatalogFeature[]
  roleKeys: Set<string>
  allowKeys: Set<string>
  denyKeys: Set<string>
}>()

const emit = defineEmits<{
  change: [permissionKey: string, checked: boolean]
}>()

function source(permissionKey: string) {
  if (props.denyKeys.has(permissionKey)) return 'user_override_deny'
  if (props.allowKeys.has(permissionKey)) return 'user_override_allow'
  if (props.roleKeys.has(permissionKey)) return 'role_default'
  return 'not_assigned'
}

function checked(permissionKey: string) {
  const currentSource = source(permissionKey)
  return currentSource === 'role_default' || currentSource === 'user_override_allow'
}

function columnLabel(column: string) {
  const labels: Record<string, string> = {
    daftar: 'Daftar',
    tambah: 'Tambah',
    ubah: 'Ubah',
    hapus: 'Hapus',
    cetak: 'Cetak',
    laporan: 'Laporan',
    persetujuan: 'Persetujuan',
  }
  return labels[column] ?? column
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <table class="w-full min-w-[760px] border-collapse text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500">
        <tr>
          <th class="w-[280px] px-4 py-3 text-left">Deskripsi akses</th>
          <th v-for="column in columns" :key="column" class="px-3 py-3 text-center">{{ columnLabel(column) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="feature in features" :key="feature.key" class="border-t border-slate-100">
          <td class="px-4 py-3 font-bold text-slate-800">{{ feature.label }}</td>
          <td v-for="column in columns" :key="column" class="px-3 py-3 text-center">
            <PermissionCheckbox
              v-if="feature.permissions[column]"
              :checked="checked(feature.permissions[column].key)"
              :source="source(feature.permissions[column].key)"
              @change="emit('change', feature.permissions[column].key, $event)"
            />
            <span v-else class="text-slate-300">-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
