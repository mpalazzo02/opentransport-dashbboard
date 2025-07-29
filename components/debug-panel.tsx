"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Bug, Database, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface DebugPanelProps {
  data?: {
    journeys?: any[]
    purchases?: any[]
    providers?: any[]
    account?: any
    [key: string]: any
  }
  className?: string
}

export function DebugPanel({ data = {}, className }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("overview")

  // Only show in dev mode
  if (process.env.NEXT_PUBLIC_DEV_MODE !== "true") {
    return null
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Settings },
    { id: "journeys", label: "Journeys", icon: Database },
    { id: "purchases", label: "Purchases", icon: Database },
    { id: "raw", label: "Raw Data", icon: Bug },
  ]

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="bg-background shadow-lg">
            <Bug className="h-4 w-4 mr-2" />
            Debug Panel
            <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", isOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="w-96 mt-2 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Bug className="h-4 w-4 mr-2" />
                Debug Information
              </CardTitle>
              <CardDescription className="text-xs">Development mode only - hidden in production</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-muted p-1 rounded-md">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="h-3 w-3 mr-1" />
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Journeys:</span>
                    <Badge variant="secondary">{data.journeys?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Purchases:</span>
                    <Badge variant="secondary">{data.purchases?.length || 0}</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Connected Providers:</span>
                    <Badge variant="secondary">{data.providers?.filter((p: any) => p.connected).length || 0}</Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Account ID:</span>
                    <code className="text-xs bg-muted px-1 rounded">
                      {data.account?.account_id?.slice(-8) || "N/A"}
                    </code>
                  </div>
                </div>
              )}

              {activeTab === "journeys" && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Recent Journeys</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {data.journeys?.slice(0, 5).map((journey: any, i: number) => (
                      <div key={i} className="text-xs bg-muted p-2 rounded">
                        <div>
                          {journey.mode?.id ?? "-"} - {journey.travel_date}
                        </div>
                        <div className="text-muted-foreground">ID: {journey.id}</div>
                      </div>
                    )) || <div className="text-xs text-muted-foreground">No journeys</div>}
                  </div>
                </div>
              )}

              {activeTab === "purchases" && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Recent Purchases</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {data.purchases?.slice(0, 5).map((purchase: any, i: number) => (
                      <div key={i} className="text-xs bg-muted p-2 rounded">
                        <div>
                          {purchase.operator?.name} - {purchase.mode?.id}
                        </div>
                        <div className="text-muted-foreground">
                          £{(purchase.transaction?.price?.amount / 100).toFixed(2)}
                        </div>
                      </div>
                    )) || <div className="text-xs text-muted-foreground">No purchases</div>}
                  </div>
                </div>
              )}

              {activeTab === "raw" && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Raw Data</div>
                  <pre className="text-xs bg-muted p-2 rounded max-h-32 overflow-auto">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
