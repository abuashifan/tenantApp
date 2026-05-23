import { useAuthStore } from '@/stores/authStore'

export function usePermission() {
  const auth = useAuthStore()

  function can(permission?: string) {
    if (!permission) return true
    return auth.permissions.includes('*') || auth.permissions.includes(permission)
  }

  return { can }
}
