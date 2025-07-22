// API Models
export type Journey = {
  transaction_id: string | number | null
  account_id: string | null
  mode_ref: string | null
  distance_km: number | "unknown" | null
  co2_g: number | "unknown" | null
  travel_date: string | null // YYYY-MM-DD
  // Additional fields from new API (optional, for future-proofing)
  [k: string]: any
}

export type Purchase = {
  id: string | null
  mode: {
    id: string | null
    "short-desc"?: string | null
    "long-desc"?: string | null
    [k: string]: any
  } | null
  operator: {
    id: string | null
    name?: string | null
    modes?: any
    "api-url"?: string | null
    phone?: string | null
    "default-language"?: string | null
    homePage?: string | null
    email?: string | null
    [k: string]: any
  } | null
  "booking-date-time": string | null
  transaction: {
    reference?: string | null
    "payment-type"?: string | null
    "payment-method"?: string | null
    "date-time": string | null
    price?: {
      amount: number | null
      currency: string | null
    } | null
    [k: string]: any
  } | null
  ticket?: {
    reference?: string | null
    code3?: string | null
    code2?: string | null
    code1?: string | null
    "number-usages"?: number | null
    medium?: string | null
    "reference-type"?: string | null
    [k: string]: any
  } | null
  "service-request"?: any
  "travel-class"?: string | null
  "travel-to-date-time"?: string | null
  "travel-from-date-time"?: string | null
  "passenger-number"?: number | null
  route?: string | null
  "location-from"?: {
    "lat-long"?: { latitude: number | null; longitude: number | null } | null
    accuracy?: string | null
    NaPTAN?: string | null
    other?: string | null
    "other-type"?: string | null
    crs?: string | null
    [k: string]: any
  } | null
  "location-to"?: {
    "lat-long"?: { latitude: number | null; longitude: number | null } | null
    accuracy?: string | null
    NaPTAN?: string | null
    other?: string | null
    "other-type"?: string | null
    crs?: string | null
    [k: string]: any
  } | null
  vehicle?: {
    reference?: string | null
    "vehicle-type"?: string | null
    included?: boolean | null
    [k: string]: any
  } | null
  conditions?: string | null
  "passenger-type"?: string | null
  agent?: string | null
  restrictions?: string | null
  "reserved-position"?: string | null
  "account-balance"?: {
    amount: number | null
    currency: string | null
  } | null
  concession?: string | null
  [k: string]: any
}

// Demo account types
export type DemoAccount = {
  id: string
  account_id: string
  name: string
  description: string
  avatar: string
}

// Provider types
export type TransportProvider = {
  id: string
  name: string
  logo: string
  description: string
  connected: boolean
  status?: "idle" | "fetching" | "complete" | "error"
  lastFetch?: Date
}

// Dashboard KPI types
export type MonthlyStats = {
  journeys: number
  totalSpend: number
  topOperator: string
  totalCO2: number
}

// Date range for data fetching
export type DateRange = {
  year: string
  month: string
}
