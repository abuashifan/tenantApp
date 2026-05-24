<script setup lang="ts">
import { onMounted } from 'vue'

import { useAccessStore } from '@/stores/access.store'

const access = useAccessStore()

onMounted(() => {
  void access.fetchRoles()
})
</script>

<template>
  <section class="space-y-4">
    <div>
      <h1 class="text-2xl font-black text-slate-950">Role Preset</h1>
      <p class="mt-1 text-sm text-slate-500">Role adalah template awal. Permission final tetap dapat dioverride per user.</p>
    </div>

    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Role</th>
            <th class="px-4 py-3 text-left">Slug</th>
            <th class="px-4 py-3 text-left">Permission</th>
            <th class="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in access.roles" :key="role.id" class="border-t border-slate-100">
            <td class="px-4 py-3 font-bold text-slate-900">{{ role.name }}</td>
            <td class="px-4 py-3 text-slate-500">{{ role.slug }}</td>
            <td class="px-4 py-3 text-slate-500">{{ role.permissions_count ?? role.permission_keys?.length ?? 0 }}</td>
            <td class="px-4 py-3 text-slate-500">{{ role.is_active ? 'Active' : 'Inactive' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
