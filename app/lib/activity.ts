export type ActivityItem = {
  id: string
  type: string
  title: string
  description: string
  status: "in-progress" | "completed" | "pending" | "error"
  timestamp: number // epoch ms
  data?: unknown
}

const STORAGE_KEY = "cms_recent_activity"

function safeParse<T>(str: string | null, fallback: T): T {
  if (!str) return fallback
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

export function addActivity(
  item: Omit<ActivityItem, "id" | "timestamp"> & { id?: string; timestamp?: number },
) {
  if (typeof window === "undefined") return
  const list = safeParse<ActivityItem[]>(localStorage.getItem(STORAGE_KEY), [])
  const now = Date.now()
  const withMeta: ActivityItem = {
    id: item.id ?? Math.random().toString(36).slice(2, 10),
    timestamp: item.timestamp ?? now,
    ...item,
  }
  const next = [withMeta, ...list].slice(0, 50)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  // dispatch a storage-like event for same-tab listeners
  window.dispatchEvent(new Event("storage"))
}

export function getActivities(): ActivityItem[] {
  if (typeof window === "undefined") return []
  const list = safeParse<ActivityItem[]>(localStorage.getItem(STORAGE_KEY), [])
  return list.sort((a, b) => b.timestamp - a.timestamp)
}
