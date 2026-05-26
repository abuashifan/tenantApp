<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import { usePermission } from '@/composables/usePermission'
import { fetchPermissionCatalog, type PermissionCatalogItem } from '@/services/access/permissions.service'
import { fetchRole, updateRole, updateRolePermissions, type AccessRole } from '@/services/access/roles.service'

const route = useRoute()
const { can } = usePermission()
const role = ref<AccessRole | null>(null)
const catalog = ref<Awaited<ReturnType<typeof fetchPermissionCatalog>> | null>(null)
const selected = ref(new Set<string>())
const search = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const notice = ref('')
const name = ref('')
const slug = ref('')
const description = ref('')

const editable = computed(() => Boolean(role.value && !role.value.is_system))
const filteredModules = computed(() => {
  const needle = search.value.trim().toLowerCase()
  if (!catalog.value) return []
  return catalog.value.modules.map((module) => ({
    ...module,
    features: module.features.map((feature) => ({
      ...feature,
      permissions: Object.fromEntries(
        Object.entries(feature.permissions).filter(([key, permission]) => !needle || `${key} ${permission.label}`.toLowerCase().includes(needle)),
      ),
    })).filter((feature) => Object.keys(feature.permissions).length > 0),
    special_permissions: module.special_permissions.filter((permission) => !needle || `${permission.key} ${permission.label}`.toLowerCase().includes(needle)),
  })).filter((module) => module.features.length > 0 || module.special_permissions.length > 0)
})

function errorText(reason: unknown) {
  return typeof reason === 'object' && reason !== null && 'message' in reason ? String(reason.message) : 'Request failed.'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const roleId = Number(route.params.id)
    ;[role.value, catalog.value] = await Promise.all([fetchRole(roleId), fetchPermissionCatalog()])
    selected.value = new Set(role.value.permission_keys ?? [])
    name.value = role.value.name
    slug.value = role.value.slug
    description.value = role.value.description ?? ''
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    loading.value = false
  }
}

function toggle(permission: PermissionCatalogItem) {
  const next = new Set(selected.value)
  if (next.has(permission.key)) next.delete(permission.key)
  else next.add(permission.key)
  selected.value = next
}

async function saveDetails() {
  if (!role.value || !editable.value) return
  saving.value = true
  error.value = ''
  try {
    role.value = await updateRole(role.value.id, { name: name.value, slug: slug.value, description: description.value })
    notice.value = 'Role details updated.'
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    saving.value = false
  }
}

async function savePermissions() {
  if (!role.value || !editable.value) return
  saving.value = true
  error.value = ''
  try {
    role.value = await updateRolePermissions(role.value.id, Array.from(selected.value))
    notice.value = 'Role permission matrix saved.'
  } catch (reason) {
    error.value = errorText(reason)
  } finally {
    saving.value = false
  }
}

onMounted(load)

watch(
  () => route.params.id,
  () => {
    void load()
  },
)
</script>

<template>
  <section class="space-y-4">
    <div>
      <h1 class="text-2xl font-black text-slate-950">Role Detail</h1>
      <p class="mt-1 text-sm text-slate-500">Edit custom role metadata and its default permission matrix.</p>
    </div>
    <p v-if="error" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <p v-if="notice" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{{ notice }}</p>
    <p v-if="loading" class="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">Loading role...</p>
    <template v-else-if="role">
      <form class="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3" @submit.prevent="saveDetails">
        <label class="text-sm font-bold text-slate-700">Name<input v-model="name" :disabled="!editable" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-50" /></label>
        <label class="text-sm font-bold text-slate-700">Slug<input v-model="slug" :disabled="!editable" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-50" /></label>
        <label class="text-sm font-bold text-slate-700">Description<input v-model="description" :disabled="!editable" class="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-50" /></label>
        <div class="md:col-span-3">
          <span v-if="role.is_system" class="text-sm font-semibold text-slate-500">System role is read-only.</span>
          <BaseButton v-else-if="can('access.roles.edit')" type="submit" :loading="saving">Save Role Details</BaseButton>
        </div>
      </form>

      <div class="flex items-end justify-between rounded-lg border border-slate-200 bg-white p-4">
        <label class="text-sm font-bold text-slate-700">Search permissions<input v-model="search" class="mt-2 block rounded-lg border border-slate-200 px-3 py-2" /></label>
        <BaseButton v-if="editable && can('access.permissions.manage')" :loading="saving" @click="savePermissions">Save Permissions</BaseButton>
      </div>
      <div v-for="module in filteredModules" :key="module.key" class="rounded-lg border border-slate-200 bg-white p-4">
        <h2 class="mb-3 text-sm font-black uppercase text-slate-700">{{ module.label }}</h2>
        <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <template v-for="feature in module.features" :key="feature.key">
            <label v-for="permission in feature.permissions" :key="permission.key" class="flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" class="mt-1" :checked="selected.has(permission.key)" :disabled="!editable || !can('access.permissions.manage')" @change="toggle(permission)" />
              <span><strong>{{ permission.label }}</strong><br /><small class="text-slate-500">{{ permission.key }}</small></span>
            </label>
          </template>
          <label v-for="permission in module.special_permissions" :key="permission.key" class="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" class="mt-1" :checked="selected.has(permission.key)" :disabled="!editable || !can('access.permissions.manage')" @change="toggle(permission)" />
            <span><strong>{{ permission.label }}</strong><br /><small class="text-slate-500">{{ permission.key }}</small></span>
          </label>
        </div>
      </div>
    </template>
  </section>
</template>
