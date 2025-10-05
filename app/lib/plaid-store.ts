export type PlaidConnection = {
  accessToken: string
  itemId: string
  connectedAt: number
}

const STORAGE_KEY = "cms_plaid_connection"

function safeParse<T>(s: string | null, fb: T): T {
  if (!s) return fb
  try {
    return JSON.parse(s) as T
  } catch {
    return fb
  }
}

export function getPlaidConnection(): PlaidConnection | null {
  if (typeof window === "undefined") return null
  return safeParse<PlaidConnection | null>(localStorage.getItem(STORAGE_KEY), null)
}

export function setPlaidConnection(conn: PlaidConnection) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conn))
  window.dispatchEvent(new Event("cms:plaid"))
}

export function clearPlaidConnection() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event("cms:plaid"))
}


