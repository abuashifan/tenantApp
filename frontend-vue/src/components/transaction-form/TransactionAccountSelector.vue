<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronDown, Search } from 'lucide-vue-next'
import { useField } from 'vee-validate'

import { listChartOfAccounts, type ChartOfAccountsListParams } from '@/features/accounting/chart-of-accounts/chartOfAccounts.service'
import { cn } from '@/utils/cn'

type AccountOption = { value: string; label: string }

const props = withDefaults(
  defineProps<{
    name: string
    label?: string
    placeholder?: string
    readonly?: boolean
    params?: ChartOfAccountsListParams
  }>(),
  {
    label: 'Account',
    placeholder: 'Select account…',
    readonly: false,
    params: () => ({ is_active: true }),
  },
)

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const options = ref<AccountOption[]>([])

const { value, setValue, handleBlur } = useField<string>(() => props.name)

const selectedLabel = computed(() => options.value.find((o) => o.value === (value.value ?? ''))?.label ?? '')
const filteredOptions = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return options.value
  return options.value.filter((o) => o.label.toLowerCase().includes(q))
})

function toggleOpen() {
  if (props.readonly) return
  open.value = !open.value
}

function close() {
  open.value = false
}

function choose(opt: AccountOption) {
  setValue(opt.value)
  close()
}

function onDocumentClick(event: MouseEvent) {
  if (!root.value) return
  if (!root.value.contains(event.target as Node)) close()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(async () => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)

  loading.value = true
  error.value = null
  try {
    const rows = await listChartOfAccounts(props.params ?? { is_active: true })
    options.value = rows.map((r) => ({ value: r.id, label: `${r.code} - ${r.name}` }))
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load accounts.'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <div ref="root" class="relative space-y-1.5">
    <span class="block text-xs font-bold text-slate-500">{{ label }}</span>

    <button
      type="button"
      :disabled="readonly"
      class="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-bold text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      @click.stop="toggleOpen"
      @blur="handleBlur"
    >
      <span :class="cn(!value ? 'text-slate-400' : '')">
        {{ value ? selectedLabel : placeholder }}
      </span>
      <ChevronDown class="h-4 w-4 text-slate-500" />
    </button>

    <p v-if="error" class="text-xs font-semibold text-rose-700">{{ error }}</p>

    <div
      v-if="open"
      class="absolute left-0 top-[calc(100%+6px)] z-40 w-[min(520px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15"
      @click.stop
    >
      <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <Search class="h-4 w-4 text-slate-500" />
        <input
          v-model="search"
          type="text"
          class="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Search account…"
        />
      </div>

      <div class="mt-2 max-h-72 overflow-auto">
        <div v-if="loading" class="px-2 py-3 text-sm font-semibold text-slate-500">Loading…</div>
        <button
          v-for="opt in filteredOptions"
          :key="opt.value"
          type="button"
          class="flex w-full items-center rounded-xl px-2 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          @click="choose(opt)"
        >
          {{ opt.label }}
        </button>
        <div v-if="!loading && filteredOptions.length === 0" class="px-2 py-3 text-sm font-semibold text-slate-500">
          No accounts found.
        </div>
      </div>
    </div>
  </div>
</template>
