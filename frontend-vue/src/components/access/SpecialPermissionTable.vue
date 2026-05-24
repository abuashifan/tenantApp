<script setup lang="ts">
import PermissionCheckbox from '@/components/access/PermissionCheckbox.vue'
import type { PermissionCatalogItem } from '@/services/access/permissions.service'

const props = defineProps<{
  permissions: PermissionCatalogItem[]
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
</script>

<template>
  <div v-if="permissions.length" class="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <table class="w-full border-collapse text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500">
        <tr>
          <th class="px-4 py-3 text-left">Deskripsi akses khusus</th>
          <th class="w-24 px-4 py-3 text-center">Akses</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="permission in permissions" :key="permission.key" class="border-t border-slate-100">
          <td class="px-4 py-3">
            <p class="font-bold text-slate-800">{{ permission.label }}</p>
            <p class="text-xs text-slate-400">{{ permission.key }}</p>
          </td>
          <td class="px-4 py-3">
            <PermissionCheckbox
              :checked="checked(permission.key)"
              :source="source(permission.key)"
              @change="emit('change', permission.key, $event)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
