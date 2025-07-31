import type { Journey, Purchase, DateRange } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.opentransport.example.com"

export class APIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "APIError"
  }
}

// Use account_id (snake_case) everywhere
export async function getJourneys(
  account_id: string,
  year: string,
  month: string
): Promise<Journey[]> {
  const res = await fetch(`/api/journey?account_id=${account_id}&year=${year}&month=${month}`)
  if (!res.ok) throw new APIError(res.status, `Failed to fetch journeys: ${res.statusText}`)
  return res.json()
}

export async function getPurchases(
  account_id: string,
  year: string,
  month: string
): Promise<Purchase[]> {
  const res = await fetch(`/api/purchases?account_id=${account_id}&year=${year}&month=${month}`)
  if (!res.ok) throw new APIError(res.status, `Failed to fetch purchases: ${res.statusText}`)
  return res.json()
}

// Fetch data for multiple months
export async function fetchMultipleMonths(
  account_id: string,
  dateRanges: DateRange[]
): Promise<{ journeys: Journey[]; purchases: Purchase[] }> {
  const journeyPromises = dateRanges.map(({ year, month }) => getJourneys(account_id, year, month))
  const purchasePromises = dateRanges.map(({ year, month }) =>
    getPurchases(account_id, year, month)
  )

  const [journeyResults, purchaseResults] = await Promise.all([
    Promise.all(journeyPromises),
    Promise.all(purchasePromises),
  ])

  return {
    journeys: journeyResults.flat(),
    purchases: purchaseResults.flat(),
  }
}
