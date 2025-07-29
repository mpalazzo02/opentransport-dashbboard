"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DebugPanel } from "@/components/debug-panel"
import { ErrorBanner } from "@/components/error-banner"
import { fetchMultipleMonths } from "@/lib/api-client"
import { loadCurrentAccount } from "@/lib/storage"
import type { Journey } from "@/lib/types"
import { formatDate, getModeIcon, getModeColor, capitalizeFirst, getDateRanges, exportToCSV, formatOperatorName } from "@/lib/utils"
import { DEMO_ACCOUNTS } from "@/lib/demo-data"
import { ArrowUpDown, Download, Eye, Search, ChevronDown, HelpCircle } from "lucide-react"

export default function JourneysPage({ purchases }: { purchases: any[] }) {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Table state
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const selectedAccount = DEMO_ACCOUNTS.find((acc) => acc.account_id === currentAccount)

  useEffect(() => {
    const account_id = loadCurrentAccount()
    if (!account_id) {
      router.push("/")
      return
    }
    setCurrentAccount(account_id)
  }, [router])

  useEffect(() => {
    if (!currentAccount) return

    const fetchJourneys = async () => {
      try {
        setLoading(true)
        setError(null)

        const dateRanges = getDateRanges(2)
        const { journeys: journeyData } = await fetchMultipleMonths(currentAccount, dateRanges)
        setJourneys(journeyData)
      } catch (err) {
        console.error("Failed to fetch journeys:", err)
        setError("Failed to load journey data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchJourneys()
  }, [currentAccount])

  const handleRowClick = (journey: Journey) => {
    setSelectedJourney(journey)
    setSheetOpen(true)
  }

  const handleExportCSV = () => {
    const filteredData = table.getFilteredRowModel().rows.map((row) => row.original)
    exportToCSV(filteredData, `journeys-${new Date().toISOString().split("T")[0]}.csv`, [
      { key: "travel_date", label: "Date" },
      { key: "mode.id", label: "Mode" },
      { key: "distance_km", label: "Distance (km)" },
      { key: "co2_g", label: "CO₂ (g)" },
      { key: "id", label: "Journey ID" },
    ])
  }

  const columns: ColumnDef<Journey>[] = useMemo(() => [
    {
      accessorKey: "travel_date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("travel_date");
        return typeof date === "string" ? formatDate(date) : "—";
      },
    },
    {
      id: "mode",
      header: "Mode",
      cell: ({ row }) => {
        const journey = row.original;
        const mode = journey.mode?.id ?? "unknown";
        return (
          <div className="flex items-center space-x-2">
            <span>{getModeIcon(mode)}</span>
            <Badge className={getModeColor(mode)}>{capitalizeFirst(mode)}</Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const journey = row.original;
        return value.includes(journey.mode?.id ?? "unknown");
      },
    },
    {
      id: "operator",
      header: "Operator",
      cell: ({ row }) => {
        const journey = row.original;
        const operatorName = journey.operator?.name || journey.operator?.id || "Unknown";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-xs max-w-[140px] truncate inline-block align-middle cursor-pointer"
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={operatorName}
                >
                  {formatOperatorName(operatorName)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {operatorName}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "distance_km",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Distance (km)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const distance = row.getValue("distance_km");
        if (distance === "unknown" || distance == null) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center text-gray-400">
                    — <HelpCircle className="h-3 w-3 ml-1" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data not available from provider</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        const num = Number(distance);
        return `${!isNaN(num) ? num.toFixed(2) : distance} km`;
      },
    },
    {
      accessorKey: "co2_g",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          CO₂ (g)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const co2 = row.getValue("co2_g");
        if (co2 === "unknown" || co2 == null) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center text-gray-400">
                    — <HelpCircle className="h-3 w-3 ml-1" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data not available from provider</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        const num = Number(co2);
        return `${!isNaN(num) ? num.toFixed(2) : co2} g`;
      },
    },
    {
      accessorKey: "id",
      header: "Journey ID",
      cell: ({ row }) => {
        const id = row.getValue("id");
        return id != null ? (
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{String(id)}</code>
        ) : "—";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row.original);
          }}
          aria-label="View journey details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ], [purchases])
  const table = useReactTable({
    columns,
    data: journeys,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

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
        <div className="h-8 bg-gray-200 animate-pulse rounded w-48" />
        <div className="h-96 bg-gray-200 animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journeys</h1>
          <p className="text-gray-600 mt-1">View and analyse your transport journeys</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorBanner message={error} onRetry={() => window.location.reload()} onDismiss={() => setError(null)} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Journey History</CardTitle>
          <CardDescription>
            All your transport journeys for the last 3 months. Click on a row to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table Controls */}
          <div className="flex items-center py-4 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mode..."
                value={(table.getColumn("mode")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("mode")?.setFilterValue(event.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto bg-transparent">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No journeys found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
              selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Journey Details</SheetTitle>
            <SheetDescription>Complete information for this journey</SheetDescription>
          </SheetHeader>
          {selectedJourney && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-sm mt-1">{typeof selectedJourney.travel_date === "string" ? formatDate(selectedJourney.travel_date) : "—"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mode</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span>{getModeIcon(selectedJourney.mode?.id ?? "")}</span>
                    <Badge className={getModeColor(selectedJourney.mode?.id ?? "")}>
                      {capitalizeFirst(selectedJourney.mode?.id ?? "")}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Distance</label>
                  <p className="text-sm mt-1">
                    {selectedJourney.distance_km === "unknown" ? (
                      <span className="text-gray-400">Unknown</span>
                    ) : (
                      `${selectedJourney.distance_km} km`
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CO₂ Emissions</label>
                  <p className="text-sm mt-1">
                    {selectedJourney.co2_g === "unknown" ? (
                      <span className="text-gray-400">Unknown</span>
                    ) : (
                      `${selectedJourney.co2_g} g`
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Journey ID</label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1 font-mono">
                    {selectedJourney.id}
                  </code>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Account ID</label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1 font-mono">
                    {selectedJourney.account_id}
                  </code>
                </div>
              </div>

              {/* Raw Data (dev mode only) */}
              {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500">Raw Data (Dev Mode)</label>
                  <pre className="text-xs bg-gray-50 p-3 rounded mt-2 overflow-auto max-h-40">
                    {JSON.stringify(selectedJourney, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Debug Panel (dev mode only) */}
      <DebugPanel
        data={{
          journeys,
          account: selectedAccount,
          filters: columnFilters,
          sorting,
        }}
      />
    </div>
  )
}
