export function useDebounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delayMs = 250,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: TArgs) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delayMs)
  }
}
