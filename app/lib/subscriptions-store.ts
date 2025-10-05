export type CancelledSub = {
  id: string
  timestamp: number
  data?: unknown
}

const STORAGE_KEY = "cms_cancelled_subscriptions"

function safeParse<T>(s: string | null, fb: T): T {
  if (!s) return fb
  try {
    return JSON.parse(s) as T
  } catch {
    return fb
  }
}

function key(id: string | number) {
  return String(id)
}

export function getCancelledMap(): Record<string, CancelledSub> {
  if (typeof window === "undefined") return {}
  return safeParse(localStorage.getItem(STORAGE_KEY), {})
}

export function isSubscriptionCancelled(id: string | number): boolean {
  return !!getCancelledMap()[key(id)]
}

export function markSubscriptionCancelled(id: string | number, data?: unknown) {
  if (typeof window === "undefined") return
  const m = getCancelledMap()
  m[key(id)] = { id: key(id), timestamp: Date.now(), data }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m))
  window.dispatchEvent(new Event("cms:subscriptions"))
}

