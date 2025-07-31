"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import type { TransportProvider } from "@/lib/types"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ProviderCardProps {
  provider: TransportProvider
  onToggle: (providerId: string, connected: boolean) => void
  className?: string
}

export function ProviderCard({ provider, onToggle, className }: ProviderCardProps) {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardContent className="p-0">
        <div
          className={cn(
            "flex items-center justify-between cursor-pointer transition-all duration-200 p-3 rounded-lg",
            !provider.connected && "hover:bg-gray-50/50",
            provider.status === "fetching" ? "cursor-not-allowed" : ""
          )}
          onClick={() => {
            if (!provider.connected && provider.status !== "fetching") {
              onToggle(provider.id, true)
            } else if (provider.connected && provider.status !== "fetching") {
              onToggle(provider.id, false)
            }
          }}
        >
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative h-8 w-16 flex-shrink-0">
              <Image
                src={provider.logo || "/placeholder.svg"}
                alt={`${provider.name} logo`}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base">{provider.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Action Button/Status */}
            {provider.status === "fetching" ? (
              <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Importing...
              </div>
            ) : provider.status === "error" ? (
              <div className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-medium">
                <XCircle className="h-4 w-4 mr-1" />
                Failed
              </div>
            ) : provider.connected ? (
              <div className="flex items-center px-3 py-1 bg-openTransport-accent/10 text-openTransport-accent rounded text-xs font-medium">
                <CheckCircle className="h-4 w-4 mr-1" />
                Connected
              </div>
            ) : (
              <div className="px-3 py-1 bg-openTransport-primary text-white rounded text-xs font-medium hover:bg-openTransport-primary/90 transition-colors">
                Connect
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
