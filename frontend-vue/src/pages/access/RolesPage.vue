<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import { usePermission } from '@/composables/usePermission'
import {
  cloneRole,
  createRole,
  deactivateRole,
  fetchRoles,
  reactivateRole,
  type AccessRole,
} from '@/services/access/roles.service'

const { can } = usePermission()
const roles = ref<AccessRole[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const showCreate = ref(false)
const name = ref('')
const slug = ref('')
const description = ref('')

function errorText(reason: unknown) {
  return typeof reason === 'object' && reason !== null && 'message' in reason ? String(reason.message) : 'Request failed.'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    roles.value = await fetchRoles()
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    loading.value = false
  }
}

async function submitCreate() {
  saving.value = true
  error.value = ''
  try {
    await createRole({ name: name.value, slug: slug.value, description: description.value })
    name.value = ''
    slug.value = ''
    description.value = ''
    showCreate.value = false
    notice.value = 'Custom role created.'
    await load()
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    saving.value = false
  }
}

async function cloneExisting(role: AccessRole) {
  const cloneName = window.prompt('Name for the cloned role', `${role.name} Copy`)
  if (!cloneName) return
  const cloneSlug = window.prompt('Slug for the cloned role', `${role.slug}-copy`)
  if (!cloneSlug) return
  try {
    await cloneRole(role.id, { name: cloneName, slug: cloneSlug })
    notice.value = 'Role cloned.'
    await load()
  } catch (reason) {
    error.value = errorText(reason)
  }
}

async function setActive(role: AccessRole, active: boolean) {
  if (!window.confirm(`${active ? 'Reactivate' : 'Deactivate'} ${role.name}?`)) return
  try {
    if (active) await reactivateRole(role.id)
    else await deactivateRole(role.id)
    notice.value = active ? 'Role reactivated.' : 'Role deactivated.'
    await load()
  } catch (reason) {
    error.value = errorText(reason)
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-black text-slate-950">Role Preset</h1>
        <p class="mt-1 text-sm text-slate-500">System roles remain read-only; custom roles are scoped to the active company.</p>
      </div>
      <BaseButton v-if="can('access.roles.create')" variant="primary" @click="showCreate = !showCreate">Create Role</BaseButton>
    </div>

    <p v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <p v-if="notice" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{{ notice }}</p>

    <form v-if="showCreate" class="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3" @submit.prevent="submitCreate">
      <label class="text-sm font-bold text-slate-700">Name<input v-model="name" required class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
      <label class="text-sm font-bold text-slate-700">Slug<input v-model="slug" required class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
      <label class="text-sm font-bold text-slate-700">Description<input v-model="description" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2" /></label>
      <div class="md:col-span-3"><BaseButton type="submit" variant="primary" :loading="saving">Save Role</BaseButton></div>
    </form>

    <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <p v-if="loading" class="p-5 text-sm text-slate-500">Loading roles...</p>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3 text-left">Role</th>
            <th class="px-4 py-3 text-left">Type</th>
            <th class="px-4 py-3 text-left">Permissions</th>
            <th class="px-4 py-3 text-left">Users</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id" class="border-t border-slate-100">
            <td class="px-4 py-3"><p class="font-bold text-slate-900">{{ role.name }}</p><p class="text-xs text-slate-500">{{ role.slug }}</p></td>
            <td class="px-4 py-3">{{ role.is_system ? 'System' : 'Custom' }}</td>
            <td class="px-4 py-3">{{ role.permissions_count ?? role.permission_keys?.length ?? 0 }}</td>
            <td class="px-4 py-3">{{ role.assigned_users_count ?? 0 }}</td>
            <td class="px-4 py-3">{{ role.is_active ? 'Active' : 'Inactive' }}</td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <RouterLink v-if="can('access.roles.view')" :to="`/access/roles/${role.id}`"><BaseButton variant="secondary" size="sm">Detail</BaseButton></RouterLink>
                <BaseButton v-if="can('access.roles.clone')" variant="secondary" size="sm" @click="cloneExisting(role)">Clone</BaseButton>
                <BaseButton v-if="!role.is_system && role.is_active && can('access.roles.deactivate')" variant="danger" size="sm" @click="setActive(role, false)">Deactivate</BaseButton>
                <BaseButton v-if="!role.is_system && !role.is_active && can('access.roles.edit')" variant="secondary" size="sm" @click="setActive(role, true)">Reactivate</BaseButton>
              </div>
            </td>
          </tr>
          <tr v-if="roles.length === 0"><td colspan="6" class="px-4 py-8 text-center text-slate-500">No roles found.</td></tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
