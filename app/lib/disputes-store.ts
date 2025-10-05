export type FiledDispute = {
  id: string
  timestamp: number
  data?: unknown
}

const STORAGE_KEY = "cms_filed_disputes"

function safeParse<T>(str: string | null, fallback: T): T {
  if (!str) return fallback
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

function normalizeId(id: string | number): string {
  return String(id)
}

export function getFiledMap(): Record<string, FiledDispute> {
  if (typeof window === "undefined") return {}
  return safeParse<Record<string, FiledDispute>>(localStorage.getItem(STORAGE_KEY), {})
}

export function isDisputeFiled(id: string | number): boolean {
  const map = getFiledMap()
  return !!map[normalizeId(id)]
}

export function markDisputeFiled(id: string | number, data?: unknown) {
  if (typeof window === "undefined") return
  const key = normalizeId(id)
  const map = getFiledMap()
  map[key] = { id: key, timestamp: Date.now(), data }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  // notify listeners
  window.dispatchEvent(new Event("cms:disputes"))
}

