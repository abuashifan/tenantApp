export function usePermission() {
  function can(_permission: string) {
    return false
  }

  return { can }
}
