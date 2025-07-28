"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProviderCard } from "@/components/provider-card"
import { DebugPanel } from "@/components/debug-panel"
import { ErrorBanner } from "@/components/error-banner"
import { DEMO_ACCOUNTS, TRANSPORT_PROVIDERS } from "@/lib/demo-data"
import { loadCurrentAccount, loadConnectedProviders, saveConnectedProviders } from "@/lib/storage"
import type { TransportProvider } from "@/lib/types"
import { Settings, Plus, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AccountsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [providers, setProviders] = useState<TransportProvider[]>([])
  const [error, setError] = useState<string | null>(null)

  const selectedAccount = DEMO_ACCOUNTS.find((acc) => acc.account_id === currentAccount)

  useEffect(() => {
    const accountId = loadCurrentAccount()
    if (!accountId) {
      router.push("/")
      return
    }
    setCurrentAccount(accountId)

    // Load connected providers from storage
    const savedProviders = loadConnectedProviders()
    if (savedProviders.length > 0) {
      setProviders(savedProviders)
    } else {
      // Initialise with default providers
      setProviders(TRANSPORT_PROVIDERS)
    }
  }, [router])

  const handleProviderToggle = async (providerId: string, connected: boolean) => {
    if (!currentAccount) return

    setError(null)

    // Update provider status
    const updatedProviders = providers.map((p) =>
      p.id === providerId
        ? { ...p, connected, status: connected ? "fetching" as const : "idle" as const }
        : p
    )
    setProviders(updatedProviders)

    if (connected) {
      try {
        // Simulate data fetch
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Update to complete status
        setProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, status: "complete", lastFetch: new Date() } : p)),
        )

        toast({
          title: "Provider Connected",
          description: `Successfully connected to ${providers.find((p) => p.id === providerId)?.name}`,
        })
      } catch (error) {
        console.error("Failed to connect provider:", error)

        // Update to error status but keep connected
        setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: "error" } : p)))

        toast({
          title: "Connection Warning",
          description: "Provider connected but data sync failed. Using demo data.",
          variant: "destructive",
        })
      }
    } else {
      // Disconnecting
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, status: "idle", lastFetch: undefined } : p)),
      )

      toast({
        title: "Provider Disconnected",
        description: `Disconnected from ${providers.find((p) => p.id === providerId)?.name}`,
      })
    }

    // Save to localStorage
    saveConnectedProviders(updatedProviders)
  }

  const handleSyncAll = async () => {
    const connectedProviders = providers.filter((p) => p.connected)
    if (connectedProviders.length === 0) return

    // Set all connected providers to fetching
    setProviders((prev) => prev.map((p) => (p.connected ? { ...p, status: "fetching" as const } : p)))

    try {
      // Simulate sync
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update all to complete
      setProviders((prev) => prev.map((p) => (p.connected ? { ...p, status: "complete", lastFetch: new Date() } : p)))

      toast({
        title: "Sync Complete",
        description: `Successfully synced data from ${connectedProviders.length} provider${connectedProviders.length !== 1 ? "s" : ""}`,
      })
    } catch (error) {
      console.error("Sync failed:", error)
      setError("Failed to sync data from some providers. Please try again.")
    }
  }

  const connectedProviders = providers.filter((p) => p.connected)
  const availableProviders = providers.filter((p) => !p.connected)

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Connected Accounts</h1>
        <p className="text-gray-600 mt-1">Manage your transport provider connections and data access</p>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={handleSyncAll} onDismiss={() => setError(null)} />}

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Active Account</span>
          </CardTitle>
          <CardDescription>Currently viewing data for this demo user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-openTransport-primary/10 flex items-center justify-center self-center">
                <span className="text-openTransport-primary font-semibold">
                  {selectedAccount.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-semibold">{selectedAccount.name}</h3>
                <p className="text-sm text-gray-600">{selectedAccount.description}</p>
                <div className="mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 flex items-center gap-2">
                    <span className="text-xs text-blue-700 font-medium">Coming Soon:</span>
                    <span className="text-xs text-gray-700">Personalise your carbon calculations by selecting your car.</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Assumed car for carbon calculations:</span>
                    <Badge variant="secondary">Ford Fiesta</Badge>
                    <Button variant="outline" size="sm" disabled className="opacity-60 pointer-events-none ml-2 font-semibold bg-muted border-muted text-muted-foreground">
                      Change Car (Coming Soon)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/")}>
              Switch Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Providers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Connected Providers ({connectedProviders.length})</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Active</span>
            </Badge>
            {connectedProviders.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncAll}
                disabled={connectedProviders.some((p) => p.status === "fetching")}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${connectedProviders.some((p) => p.status === "fetching") ? "animate-spin" : ""}`}
                />
                Sync All
              </Button>
            )}
          </div>
        </div>

        {connectedProviders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {connectedProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} onToggle={handleProviderToggle} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Connected Providers</h3>
                <p className="text-gray-600 mb-6">
                  Connect your transport providers to start importing journey data and viewing analytics.
                </p>
                <Button
                  onClick={() => {
                    document.getElementById("available-providers")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }}
                >
                  Connect Provider
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Available Providers */}
      <div id="available-providers">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Providers ({availableProviders.length})</h2>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Request New Provider
          </Button>
        </div>

        {availableProviders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {availableProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} onToggle={handleProviderToggle} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-openTransport-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Providers Connected!</h3>
                <p className="text-gray-600">You've connected all available transport providers.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Data Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Data Synchronisation</CardTitle>
          <CardDescription>Last sync status and data freshness information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Connected providers</span>
              <Badge variant="secondary">{connectedProviders.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last sync</span>
              <span className="text-sm text-gray-600">
                {connectedProviders.some((p) => p.lastFetch) ? "2 hours ago" : "Never"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data coverage</span>
              <Badge variant="secondary">Last 3 months</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sync status</span>
              <Badge variant={connectedProviders.some((p) => p.status === "error") ? "destructive" : "secondary"}>
                {connectedProviders.some((p) => p.status === "fetching")
                  ? "Syncing..."
                  : connectedProviders.some((p) => p.status === "error")
                    ? "Issues detected"
                    : "Up to date"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel (dev mode only) */}
      <DebugPanel
        data={{
          providers,
          account: selectedAccount,
          connectedCount: connectedProviders.length,
        }}
      />
    </div>
  )
}
