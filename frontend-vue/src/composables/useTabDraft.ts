import { ref } from 'vue'

export function useTabDraft() {
  const hasDraft = ref(false)

  function markDirty() {
    hasDraft.value = true
  }

  function clear() {
    hasDraft.value = false
  }

  return { hasDraft, markDirty, clear }
}
