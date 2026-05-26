<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import CopyAccessDialog from '@/components/access/CopyAccessDialog.vue'
import PermissionMatrixTable from '@/components/access/PermissionMatrixTable.vue'
import PermissionModuleTabs from '@/components/access/PermissionModuleTabs.vue'
import SpecialPermissionTable from '@/components/access/SpecialPermissionTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAccessStore } from '@/stores/access.store'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'

const access = useAccessStore()
const auth = useAuthStore()
const route = useRoute()
const activeModuleKey = ref('')
const selectedCompanyUserId = ref<number | null>(null)
const selectedRoleId = ref<number | null>(null)
const copyOpen = ref(false)
const message = ref('')

const activeModule = computed(() =>
  access.permissionCatalog?.modules.find((module) => module.key === activeModuleKey.value) ?? access.permissionCatalog?.modules[0],
)

const roleKeys = computed(() => new Set(access.effectivePermissions?.role_permission_keys ?? []))
const allowKeys = computed(() => new Set(access.overrides.filter((item) => item.effect === 'allow').map((item) => item.permission_key)))
const denyKeys = computed(() => new Set(access.overrides.filter((item) => item.effect === 'deny').map((item) => item.permission_key)))
const selectedUser = computed(() => access.companyUsers.find((user) => user.id === selectedCompanyUserId.value) ?? null)

async function load() {
  access.loading = true
  access.error = ''
  try {
    await Promise.all([access.fetchCompanyUsers(), access.fetchRoles(), access.fetchPermissionCatalog()])
    const requestedUserId = Number(route.params.id)
    selectedCompanyUserId.value = selectedCompanyUserId.value
      ?? (Number.isInteger(requestedUserId) && requestedUserId > 0 ? requestedUserId : null)
      ?? access.selectedCompanyUser?.id
      ?? access.companyUsers[0]?.id
      ?? null
    activeModuleKey.value = activeModuleKey.value || access.permissionCatalog?.modules[0]?.key || ''
    if (selectedCompanyUserId.value) await loadUser(selectedCompanyUserId.value)
  } catch (error) {
    access.error = error instanceof Error ? error.message : 'Unable to load access data.'
  } finally {
    access.loading = false
  }
}

async function loadUser(companyUserId: number) {
  await access.fetchUserPermissions(companyUserId)
  selectedRoleId.value = access.effectivePermissions?.company_user.role_id ?? null
}

async function save() {
  if (!selectedCompanyUserId.value) return
  message.value = ''
  access.error = ''
  try {
    await access.updateUserPermissions(selectedCompanyUserId.value, selectedRoleId.value)
    if (access.effectivePermissions?.company_user.user_id === auth.user?.id) {
      const response = await api.get<ApiResponse<{ permissions: string[] }>>('/auth/permissions')
      auth.setPermissions(unwrap(response.data).permissions)
    }
    message.value = 'Hak akses tersimpan.'
  } catch (error) {
    access.error = error instanceof Error ? error.message : 'Unable to save access data.'
  }
}

async function reset() {
  if (!selectedCompanyUserId.value) return
  access.error = ''
  try {
    await access.resetPermissions(selectedCompanyUserId.value)
    selectedRoleId.value = access.effectivePermissions?.company_user.role_id ?? null
    message.value = 'Override dihapus. Permission kembali ke role default.'
  } catch (error) {
    access.error = error instanceof Error ? error.message : 'Unable to reset permissions.'
  }
}

async function copyAccess(payload: { source_company_user_id: number; copy_role: boolean; copy_overrides: boolean }) {
  if (!selectedCompanyUserId.value) return
  access.error = ''
  try {
    await access.copyAccess(selectedCompanyUserId.value, payload)
    selectedRoleId.value = access.effectivePermissions?.company_user.role_id ?? null
    copyOpen.value = false
    message.value = 'Hak akses berhasil disalin.'
  } catch (error) {
    access.error = error instanceof Error ? error.message : 'Unable to copy permissions.'
  }
}

watch(selectedCompanyUserId, (id) => {
  if (id) void loadUser(id)
})

watch(
  () => route.params.id,
  (id) => {
    const requestedUserId = Number(id)
    if (Number.isInteger(requestedUserId) && requestedUserId > 0 && requestedUserId !== selectedCompanyUserId.value) {
      selectedCompanyUserId.value = requestedUserId
    }
  },
)

onMounted(load)
</script>

<template>
  <section class="space-y-5">
    <div class="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-950">Hak Akses Pengguna</h1>
        <p class="mt-1 text-sm text-slate-500">Role hanya preset awal. Permission final bisa disesuaikan per user dan company.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="secondary" :disabled="!selectedCompanyUserId" @click="copyOpen = true">Salin Hak Akses</BaseButton>
        <BaseButton variant="secondary" :disabled="!selectedCompanyUserId" @click="reset">Reset ke Role Default</BaseButton>
        <BaseButton variant="primary" :loading="access.saving" :disabled="!selectedCompanyUserId" @click="save">Simpan</BaseButton>
      </div>
    </div>

    <div v-if="access.error" class="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
      {{ access.error }}
    </div>
    <div v-if="message" class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
      {{ message }}
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <label class="block text-sm font-bold text-slate-700">
        Pilih User / Masuk Sebagai
        <select v-model.number="selectedCompanyUserId" class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
          <option v-for="user in access.companyUsers" :key="user.id" :value="user.id">
            {{ user.name }} - {{ user.email }}
          </option>
        </select>
      </label>
      <div class="rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p class="text-xs font-bold uppercase text-slate-400">Nama Akun</p>
        <p class="mt-1 font-black text-slate-900">{{ selectedUser?.name ?? '-' }}</p>
        <p class="text-xs text-slate-500">{{ selectedUser?.email }}</p>
      </div>
      <label class="block text-sm font-bold text-slate-700">
        Level Pengguna / Role Preset
        <select v-model.number="selectedRoleId" class="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
          <option :value="null">Tanpa role preset</option>
          <option v-for="role in access.roles" :key="role.id" :value="role.id">
            {{ role.name }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="access.loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500">
      Loading permission matrix...
    </div>

    <template v-else-if="access.permissionCatalog && access.effectivePermissions && activeModule">
      <PermissionModuleTabs
        :modules="access.permissionCatalog.modules"
        :active-module-key="activeModule.key"
        @select="activeModuleKey = $event"
      />

      <PermissionMatrixTable
        :columns="access.permissionCatalog.matrix_columns"
        :features="activeModule.features"
        :role-keys="roleKeys"
        :allow-keys="allowKeys"
        :deny-keys="denyKeys"
        @change="access.computeLocalOverrideChange"
      />

      <SpecialPermissionTable
        :permissions="activeModule.special_permissions"
        :role-keys="roleKeys"
        :allow-keys="allowKeys"
        :deny-keys="denyKeys"
        @change="access.computeLocalOverrideChange"
      />

      <div class="flex flex-wrap gap-2 text-xs font-bold">
        <span class="rounded-md bg-[#1d81af] px-2 py-1 text-white">Default role</span>
        <span class="rounded-md bg-emerald-100 px-2 py-1 text-emerald-800">Tambahan user</span>
        <span class="rounded-md bg-amber-50 px-2 py-1 text-amber-700">Dicabut dari user</span>
        <span class="rounded-md border border-slate-200 px-2 py-1 text-slate-500">Tidak diberikan</span>
      </div>
    </template>

    <CopyAccessDialog
      :open="copyOpen"
      :users="access.companyUsers"
      :target-user-id="selectedCompanyUserId ?? undefined"
      @close="copyOpen = false"
      @confirm="copyAccess"
    />
  </section>
</template>
