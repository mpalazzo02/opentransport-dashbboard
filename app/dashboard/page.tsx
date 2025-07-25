"use client"

import { useEffect, useState, useMemo } from "react"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DebugPanel } from "@/components/debug-panel"
import { ErrorBanner } from "@/components/error-banner"
import { fetchMultipleMonths } from "@/lib/api-client"
import { loadCurrentAccount } from "@/lib/storage"
import type { Journey, Purchase } from "@/lib/types"
import { formatCurrency, getModeIcon, calculateMonthlyStats, getDateRanges, formatOperatorName } from "@/lib/utils"
import JourneysPage from "./journeys/page"
import { DEMO_ACCOUNTS } from "@/lib/demo-data"
import { Route, CreditCard, Building2, Leaf, TrendingUp, ArrowRight, Calendar } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedAccount = DEMO_ACCOUNTS.find((acc) => acc.account_id === currentAccount)

  useEffect(() => {
    const account_id = loadCurrentAccount()
    if (account_id) {
      setCurrentAccount(account_id)
    }
  }, [])

  useEffect(() => {
    if (!currentAccount) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all months of 2023 for demo data
        const dateRanges = Array.from({ length: 12 }, (_, i) => ({ year: '2023', month: String(i + 1).padStart(2, '0') }))
        const { journeys: journeyData, purchases: purchaseData } = await fetchMultipleMonths(currentAccount, dateRanges)

        setJourneys(journeyData)
        setPurchases(purchaseData)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError("Failed to load transport data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentAccount])

  // Calculate current month stats
  // Always show stats for December 2023 (demo data)
  const currentMonthStats = useMemo(() => {
    const currentMonth = "2023-12"
    return calculateMonthlyStats(journeys, purchases, currentMonth)
  }, [journeys, purchases])

  // Recent journeys for quick view
  const recentJourneys = useMemo(() => {
    return journeys
      .filter(j => !!j && !!j.travel_date)
      .sort((a, b) => {
        const aDate = a?.travel_date ? new Date(a.travel_date).getTime() : 0;
        const bDate = b?.travel_date ? new Date(b.travel_date).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 5)
  }, [journeys])

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-openTransport-primary mx-auto mb-4"></div>
          <p>Loading account...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {selectedAccount.name.split(" ")[0]}</h1>
        <p className="text-gray-600 mt-1">Here's your transport activity for this month</p>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorBanner message={error} onRetry={() => window.location.reload()} onDismiss={() => setError(null)} />
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Journeys This Month"
          value={currentMonthStats.journeys}
          change="+12% from last month"
          trend="up"
          icon={<Route className="h-4 w-4" />}
        />
        <StatCard
          title="Total Spend"
          value={formatCurrency(currentMonthStats.totalSpend)}
          change="+8% from last month"
          trend="up"
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard
          title="Top Operator"
          value={formatOperatorName(currentMonthStats.topOperator)}
          change="Most frequent"
          trend="neutral"
          icon={<Building2 className="h-4 w-4" />}
        />
        <StatCard
          title="CO₂ Estimate"
          value={`${(currentMonthStats.totalCO2 / 1000).toFixed(1)}kg`}
          change="-5% from last month"
          trend="down"
          icon={<Leaf className="h-4 w-4" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Journeys */}
        {/* Recent Journeys */}
        {/* Recent Journeys Table (with operator lookup) */}
        <div>
          <JourneysPage purchases={purchases} />
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Month's Summary</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average journey cost</span>
                <span className="text-sm">
                  {currentMonthStats.journeys > 0
                    ? formatCurrency(currentMonthStats.totalSpend / currentMonthStats.journeys)
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Most used transport</span>
                <Badge variant="secondary" className="capitalize">
                  {journeys.length > 0
                    ? (() => {
                        const modeCounts = journeys.reduce((acc, j) => {
                          const mode = j?.mode_ref ?? "unknown";
                          acc[mode] = (acc[mode] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const top = Object.entries(modeCounts).reduce((a, b) => (a[1] > b[1] ? a : b), ["—", 0]);
                        return top[0];
                      })()
                    : "—"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total distance</span>
                <span className="text-sm">
                  {Intl.NumberFormat("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(
                    journeys.reduce((sum, j) => sum + (typeof j?.distance_km === "number" ? j.distance_km : 0), 0)
                  )}km
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data coverage</span>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Last 3 months
                </Badge>
              </div>
              <div className="pt-4">
                <Button className="w-full" asChild>
                  <Link href="/dashboard/transactions">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Detailed Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Panel (dev mode only) */}
      <DebugPanel
        data={{
          journeys,
          purchases,
          account: selectedAccount,
          stats: currentMonthStats,
        }}
      />
    </div>
  )
}
