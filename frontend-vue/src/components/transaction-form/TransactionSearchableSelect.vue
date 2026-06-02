<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronDown, Search } from 'lucide-vue-next'
import { useField } from 'vee-validate'

import { cn } from '@/utils/cn'

type SelectValue = string | number | null
type SelectedDisplayMode = 'code' | 'code-name' | 'name'
type SelectedFontWeight = 'normal' | 'medium'

const props = withDefaults(
  defineProps<{
    name?: string
    modelValue?: SelectValue
    options: unknown[]
    optionValue?: string
    optionLabel?: string
    displayValue?: string
    label?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    loading?: boolean
    error?: string | null
    emptyText?: string
    loadingText?: string
    teleport?: boolean
    minSearchLength?: number
    compact?: boolean
    selectedDisplayMode?: SelectedDisplayMode
    selectedMaxOneLine?: boolean
    selectedFontWeight?: SelectedFontWeight
    optionTwoLine?: boolean
  }>(),
  {
    name: '',
    optionValue: 'value',
    optionLabel: 'label',
    displayValue: '',
    label: '',
    placeholder: 'Select...',
    disabled: false,
    readonly: false,
    loading: false,
    error: null,
    emptyText: 'No options found.',
    loadingText: 'Loading...',
    teleport: true,
    minSearchLength: 0,
    compact: false,
    selectedDisplayMode: 'code-name',
    selectedMaxOneLine: true,
    selectedFontWeight: 'normal',
    optionTwoLine: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: SelectValue]
  select: [option: unknown]
  search: [keyword: string]
  open: []
  close: []
}>()

const field = useField<SelectValue>(() => props.name || '__standalone_searchable_select')
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const dropdown = ref<HTMLElement | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const open = ref(false)
const search = ref('')
const highlightedIndex = ref(-1)
const dropdownStyle = ref<Record<string, string>>({})

function asRecord(option: unknown) {
  return option !== null && typeof option === 'object' ? (option as Record<string, unknown>) : {}
}

function getOptionValue(option: unknown): SelectValue {
  const record = asRecord(option)
  const value = record[props.optionValue] ?? record.value ?? record.id
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

function getOptionLabel(option: unknown) {
  const record = asRecord(option)
  const value = record[props.optionLabel] ?? record.label ?? record.name
  return value == null ? '' : String(value)
}

function getOptionCode(option: unknown) {
  const record = asRecord(option)
  const value = record.code ?? record.product_code ?? record.department_code ?? record.project_code
  return value == null ? '' : String(value)
}

function getOptionName(option: unknown) {
  const record = asRecord(option)
  const value = record.name ?? record.product_name ?? record.department_name ?? record.project_name
  return value == null ? '' : String(value)
}

function splitLabel(label: string) {
  const parts = label.split(/\s+-\s+|\s+·\s+/)
  const code = parts[0]?.trim() ?? ''
  const name = parts.slice(1).join(' ').trim()
  return { code, name }
}

function displayParts(option: unknown, fallback = '') {
  const label = getOptionLabel(option) || fallback
  const fromLabel = splitLabel(label)
  const code = getOptionCode(option) || fromLabel.code
  const name = getOptionName(option) || fromLabel.name
  return { code, name, label }
}

function formatSelectedLabel(label: string) {
  const { code, name } = splitLabel(label)
  if (props.selectedDisplayMode === 'code') return code || label
  if (props.selectedDisplayMode === 'name') return name || label
  return code && name ? `${code} · ${name}` : label
}

const selectedValue = computed<SelectValue>(() => (props.modelValue !== undefined ? props.modelValue : field.value.value))
const selectedLabel = computed(() => {
  const selected = props.options.find((option) => String(getOptionValue(option) ?? '') === String(selectedValue.value ?? ''))
  return selected ? getOptionLabel(selected) : props.displayValue
})
const selectedText = computed(() => (selectedValue.value ? formatSelectedLabel(selectedLabel.value || props.placeholder) : props.placeholder))
const selectedTitle = computed(() => (selectedValue.value ? selectedLabel.value || selectedText.value : props.placeholder))
const filteredOptions = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (keyword.length < props.minSearchLength) return []
  if (!keyword) return props.options
  return props.options.filter((option) => getOptionLabel(option).toLowerCase().includes(keyword))
})
const isDisabled = computed(() => props.disabled || props.readonly)
const triggerClass = computed(() =>
  cn(
    'flex w-full min-w-0 items-center justify-between gap-1.5 overflow-hidden border border-slate-200 bg-white text-left text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
    props.compact ? 'h-8 rounded-lg px-2 text-xs' : 'h-9 rounded-lg px-2.5 text-sm',
    props.selectedFontWeight === 'medium' ? 'font-medium' : 'font-normal',
  ),
)
const selectedClass = computed(() =>
  cn(
    'block min-w-0 flex-1 overflow-hidden',
    props.selectedMaxOneLine && 'truncate whitespace-nowrap',
    props.compact ? 'text-xs leading-none' : 'text-sm leading-5',
    props.selectedFontWeight === 'medium' ? 'font-medium' : 'font-normal',
    !selectedValue.value ? 'text-slate-400' : '',
  ),
)

function updatePosition() {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return
  const gutter = 8
  const gap = 6
  const availableWidth = window.innerWidth - gutter * 2
  const width = Math.min(Math.max(rect.width, 280), availableWidth)
  const left = Math.min(Math.max(rect.left, gutter), window.innerWidth - width - gutter)
  const below = window.innerHeight - rect.bottom - gap - gutter
  const above = rect.top - gap - gutter
  const opensAbove = below < 180 && above > below
  const maxHeight = Math.max(120, Math.min(288, opensAbove ? above : below))

  dropdownStyle.value = {
    left: `${left}px`,
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
    ...(opensAbove ? { bottom: `${window.innerHeight - rect.top + gap}px` } : { top: `${rect.bottom + gap}px` }),
  }
}

async function showDropdown() {
  if (isDisabled.value || open.value) return
  open.value = true
  search.value = ''
  highlightedIndex.value = -1
  emit('open')
  emit('search', '')
  await nextTick()
  updatePosition()
  searchInput.value?.focus()
}

function closeDropdown() {
  if (!open.value) return
  open.value = false
  highlightedIndex.value = -1
  field.handleBlur()
  emit('close')
}

function selectOption(option: unknown) {
  const value = getOptionValue(option)
  if (props.name) field.setValue(value)
  emit('update:modelValue', value)
  emit('select', option)
  closeDropdown()
}

function moveHighlight(offset: number) {
  if (!filteredOptions.value.length) return
  const next = highlightedIndex.value + offset
  highlightedIndex.value = next < 0 ? filteredOptions.value.length - 1 : next % filteredOptions.value.length
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
    event.preventDefault()
    void showDropdown()
  }
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveHighlight(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveHighlight(-1)
  } else if (event.key === 'Enter' && highlightedIndex.value >= 0) {
    event.preventDefault()
    const option = filteredOptions.value[highlightedIndex.value]
    if (option) selectOption(option)
  } else if (event.key === 'Escape') {
    event.preventDefault()
    closeDropdown()
    trigger.value?.focus()
  }
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as Node
  if (root.value?.contains(target) || dropdown.value?.contains(target)) return
  closeDropdown()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeDropdown()
}

function attachFloatingListeners() {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
}

function removeFloatingListeners() {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
}

watch(open, (isOpen) => {
  if (isOpen) attachFloatingListeners()
  else removeFloatingListeners()
})

watch(search, (keyword) => {
  highlightedIndex.value = -1
  emit('search', keyword)
})

onBeforeUnmount(removeFloatingListeners)
</script>

<template>
  <div ref="root" class="relative min-w-0 space-y-1">
    <span v-if="label" class="block truncate text-[11px] font-bold leading-4 text-slate-500">{{ label }}</span>
    <button
      ref="trigger"
      type="button"
      :disabled="isDisabled"
      :class="triggerClass"
      :title="selectedTitle"
      @click.stop="open ? closeDropdown() : showDropdown()"
      @keydown="onTriggerKeydown"
    >
      <span :class="selectedClass">
        {{ selectedText }}
      </span>
      <ChevronDown :class="cn('shrink-0 text-slate-500', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')" />
    </button>
    <p v-if="error" class="text-xs font-semibold text-rose-700">{{ error }}</p>

    <Teleport v-if="teleport" to="body">
      <div
        v-if="open"
        ref="dropdown"
        :style="dropdownStyle"
        class="fixed z-[9999] flex flex-col rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15"
        @pointerdown.stop
      >
        <div class="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Search class="h-4 w-4 text-slate-500" />
          <input
            ref="searchInput"
            v-model="search"
            type="text"
            class="w-full bg-transparent text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Search..."
            @keydown="onSearchKeydown"
          />
        </div>
        <div class="mt-2 min-h-0 overflow-auto">
          <div v-if="loading" class="px-2 py-3 text-sm font-semibold text-slate-500">{{ loadingText }}</div>
          <button
            v-for="(option, index) in filteredOptions"
            v-else
            :key="String(getOptionValue(option) ?? index)"
            type="button"
            :class="cn('flex w-full min-w-0 rounded-xl px-2 py-2 text-left text-sm font-normal text-slate-700 hover:bg-slate-50', highlightedIndex === index && 'bg-slate-50')"
            @pointerdown.prevent="selectOption(option)"
          >
            <span v-if="optionTwoLine" class="block min-w-0">
              <span class="block truncate text-xs font-medium text-slate-900">{{ displayParts(option).code || getOptionLabel(option) }}</span>
              <span class="mt-0.5 block truncate text-xs font-normal text-slate-500">{{ displayParts(option).name || getOptionLabel(option) }}</span>
            </span>
            <span v-else class="block min-w-0 truncate">{{ getOptionLabel(option) }}</span>
          </button>
          <div v-if="!loading && !error && filteredOptions.length === 0" class="px-2 py-3 text-sm font-semibold text-slate-500">
            {{ emptyText }}
          </div>
          <div v-if="!loading && error" class="px-2 py-3 text-sm font-semibold text-rose-700">{{ error }}</div>
        </div>
      </div>
    </Teleport>

    <div
      v-else-if="open"
      ref="dropdown"
      class="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/15"
      @pointerdown.stop
    >
      <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <Search class="h-4 w-4 text-slate-500" />
        <input ref="searchInput" v-model="search" type="text" class="w-full bg-transparent text-sm outline-none" placeholder="Search..." @keydown="onSearchKeydown" />
      </div>
      <div class="mt-2 max-h-72 overflow-auto">
        <button
          v-for="(option, index) in filteredOptions"
          :key="String(getOptionValue(option) ?? index)"
          type="button"
          class="flex w-full min-w-0 rounded-xl px-2 py-2 text-left text-sm font-normal text-slate-700 hover:bg-slate-50"
          @pointerdown.prevent="selectOption(option)"
        >
          <span v-if="optionTwoLine" class="block min-w-0">
            <span class="block truncate text-xs font-medium text-slate-900">{{ displayParts(option).code || getOptionLabel(option) }}</span>
            <span class="mt-0.5 block truncate text-xs font-normal text-slate-500">{{ displayParts(option).name || getOptionLabel(option) }}</span>
          </span>
          <span v-else class="block min-w-0 truncate">{{ getOptionLabel(option) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
