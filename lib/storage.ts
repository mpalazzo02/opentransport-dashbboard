import type { TransportProvider } from "./types"

const STORAGE_KEYS = {
  CONNECTED_PROVIDERS: "open-transport-providers",
  CURRENT_ACCOUNT: "open-transport-account",
  LAST_FETCH: "open-transport-last-fetch",
} as const

export function saveConnectedProviders(providers: TransportProvider[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.CONNECTED_PROVIDERS, JSON.stringify(providers))
  }
}

export function loadConnectedProviders(): TransportProvider[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEYS.CONNECTED_PROVIDERS)
    return stored ? JSON.parse(stored) : []
  }
  return []
}

export function saveCurrentAccount(accountId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.CURRENT_ACCOUNT, accountId)
  }
}

export function loadCurrentAccount(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_ACCOUNT)
  }
  return null
}

export function saveLastFetch(accountId: string, timestamp: Date) {
  if (typeof window !== "undefined") {
    const data = { [accountId]: timestamp.toISOString() }
    localStorage.setItem(STORAGE_KEYS.LAST_FETCH, JSON.stringify(data))
  }
}

export function loadLastFetch(accountId: string): Date | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_FETCH)
    if (stored) {
      const data = JSON.parse(stored)
      return data[accountId] ? new Date(data[accountId]) : null
    }
  }
  return null
}
