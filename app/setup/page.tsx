"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProviderCard } from "@/components/provider-card"
import { ErrorBanner } from "@/components/error-banner"
import { DEMO_ACCOUNTS, TRANSPORT_PROVIDERS } from "@/lib/demo-data"
import { loadCurrentAccount, saveConnectedProviders } from "@/lib/storage"
import { fetchMultipleMonths } from "@/lib/api-client"
import { getDateRanges } from "@/lib/utils"
import type { TransportProvider } from "@/lib/types"
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function SetupPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [providers, setProviders] = useState<TransportProvider[]>(TRANSPORT_PROVIDERS)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const selectedAccount = DEMO_ACCOUNTS.find((acc) => acc.account_id === currentAccount)
  const connectedProviders = providers.filter((p) => p.connected)
  const hasConnectedProviders = connectedProviders.length > 0

  useEffect(() => {
    const accountId = loadCurrentAccount()
    if (!accountId) {
      router.push("/")
      return
    }
    setCurrentAccount(accountId)
  }, [router])

  const handleProviderToggle = async (providerId: string, connected: boolean) => {
    if (!currentAccount) return

    setError(null)

    // Update provider status to fetching
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, connected, status: connected ? "fetching" : "idle" } : p)),
    )

    if (connected) {
      try {
        // Fetch data for the last 3 months
        const dateRanges = getDateRanges(2) // Current + 2 previous months
        await fetchMultipleMonths(currentAccount, dateRanges)

        // Update provider status to complete
        setProviders((prev) =>
          prev.map((p) => (p.id === providerId ? { ...p, status: "complete", lastFetch: new Date() } : p)),
        )

        toast({
          title: "Provider Connected",
          description: `Successfully imported data from ${providers.find((p) => p.id === providerId)?.name}`,
        })
      } catch (error) {
        console.error("Failed to fetch data:", error)

        // Update provider status to error but keep connected
        setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, status: "error" } : p)))

        toast({
          title: "Import Warning",
          description: "Provider connected but using demo data. Check your connection.",
          variant: "destructive",
        })
      }
    } else {
      // Disconnecting - reset status
      setProviders((prev) =>
        prev.map((p) => (p.id === providerId ? { ...p, status: "idle", lastFetch: undefined } : p)),
      )
    }

    // Save to localStorage
    const updatedProviders = providers.map((p) => (p.id === providerId ? { ...p, connected } : p))
    saveConnectedProviders(updatedProviders)
  }

  const handleContinue = () => {
    if (!hasConnectedProviders) return

    setIsComplete(true)

    // Brief delay before navigation for UX
    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  if (!selectedAccount) {
    return (
      <main className="min-h-screen bg-openTransport-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading account...</p>
        </div>
      </main>
    )
  }

  if (isComplete) {
    return (
      <main className="min-h-screen bg-openTransport-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-openTransport-accent mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Setup Complete!</h2>
            <p className="text-gray-600 mb-4">Your transport data has been imported. Redirecting to dashboard...</p>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-openTransport-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="sr-only">Setup: Connect Your Providers</h1>
              <Link
                href="/"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to accounts
              </Link>
              <h2 className="text-3xl font-bold text-gray-900">Connect Your Providers</h2>
              <p className="text-gray-600 mt-1">
                Welcome, <span className="font-medium">{selectedAccount.name}</span>. Choose which transport providers
                to connect.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} className="mb-6" />}

          {/* Main Content */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">Transport Providers</h3>
              <CardDescription>
                Select providers to import your journey data. Data will be fetched immediately upon connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} onToggle={handleProviderToggle} />
              ))}

              {/* Status Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Connection Status</h4>
                    <p className="text-sm text-gray-600">
                      {connectedProviders.length} provider{connectedProviders.length !== 1 ? "s" : ""} connected
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {connectedProviders.some((p) => p.status === "fetching") && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing data...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-between pt-6 border-t">
                <div className="text-sm text-gray-600">
                  {hasConnectedProviders
                    ? "Ready to continue to dashboard"
                    : "Connect at least one provider to continue"}
                </div>
                <Button
                  onClick={handleContinue}
                  disabled={!hasConnectedProviders || connectedProviders.some((p) => p.status === "fetching")}
                  className="min-w-[120px]"
                >
                  {connectedProviders.some((p) => p.status === "fetching") ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
