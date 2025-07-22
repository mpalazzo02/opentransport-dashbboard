import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Journey, Purchase, MonthlyStats } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "GBP"): string {

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString))
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getModeIcon(mode: string): string {
  const icons: Record<string, string> = {
    bus: "🚌",
    train: "🚆",
    tube: "🚇",
    tram: "🚊",
    taxi: "🚕",
    bike: "🚲",
    walk: "🚶",
  }
  return icons[mode] || "🚌"
}

export function getModeColor(mode: string): string {
  const colors: Record<string, string> = {
    bus: "bg-blue-100 text-blue-800",
    train: "bg-green-100 text-green-800",
    tube: "bg-red-100 text-red-800",
    tram: "bg-purple-100 text-purple-800",
    taxi: "bg-yellow-100 text-yellow-800",
    bike: "bg-orange-100 text-orange-800",
    walk: "bg-gray-100 text-gray-800",
  }
  return colors[mode] || "bg-gray-100 text-gray-800"
}

export function calculateMonthlyStats(journeys: Journey[], purchases: Purchase[], targetMonth?: string): MonthlyStats {
  // Filter for target month if specified
  const filteredJourneys = targetMonth
    ? journeys.filter((j) => typeof j?.travel_date === "string" && j.travel_date?.startsWith(targetMonth))
    : journeys

  const filteredPurchases = targetMonth
    ? purchases.filter((p) => typeof p?.transaction?.["date-time"] === "string" && p.transaction["date-time"]?.startsWith(targetMonth))
    : purchases

  const totalSpend = filteredPurchases.reduce((sum, purchase) => {
    const amount = purchase?.transaction?.price?.amount
    return sum + (typeof amount === "number" ? amount : 0)
  }, 0)

  const operatorCounts = filteredPurchases.reduce(
    (acc, purchase) => {
      const operatorName = purchase?.operator?.name || purchase?.operator?.id || "Unknown"
      acc[operatorName] = (acc[operatorName] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topOperator = Object.keys(operatorCounts).reduce(
    (a, b) => (operatorCounts[a] > operatorCounts[b] ? a : b),
    "None",
  )

  const totalCO2 = filteredJourneys.reduce((sum, journey) => {
    const co2 = journey?.co2_g
    return sum + (typeof co2 === "number" ? co2 : 0)
  }, 0)

  return {
    journeys: filteredJourneys.length,
    totalSpend,
    topOperator,
    totalCO2,
  }
}

export function getDateRanges(monthsBack = 2): Array<{ year: string; month: string }> {
  // Force demo to use 2023 for all date ranges
  const ranges = []
  const demoYear = 2023
  const demoMonth = 7 // July, or pick a month you know has data
  for (let i = 0; i <= monthsBack; i++) {
    const date = new Date(demoYear, demoMonth - i - 1, 1)
    ranges.push({
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString(),
    })
  }
  return ranges
}

export function exportToCSV(data: any[], filename: string, columns: Array<{ key: string; label: string }>) {
  const headers = columns.map((col) => col.label).join(",")
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = getNestedValue(item, col.key)
        return typeof value === "string" && value.includes(",") ? `"${value}"` : value
      })
      .join(","),
  )

  const csvContent = [headers, ...rows].join("\n")
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj) ?? ""
}
