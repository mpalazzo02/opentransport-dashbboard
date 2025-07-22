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
import { DebugPanel } from "@/components/debug-panel"
import { ErrorBanner } from "@/components/error-banner"
import { fetchMultipleMonths } from "@/lib/api-client"
import { loadCurrentAccount } from "@/lib/storage"
import type { Purchase } from "@/lib/types"
import {
  formatDateTime,
  formatCurrency,
  getModeIcon,
  getModeColor,
  capitalizeFirst,
  getDateRanges,
  exportToCSV,
} from "@/lib/utils"
import { DEMO_ACCOUNTS } from "@/lib/demo-data"
import { ArrowUpDown, Download, Eye, Search, ChevronDown } from "lucide-react"

export default function TransactionsPage() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)
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

    const fetchPurchases = async () => {
      try {
        setLoading(true)
        setError(null)

        // Hardcode to fetch all months of 2023 for demo data
        const dateRanges = Array.from({ length: 12 }, (_, i) => ({ year: '2023', month: String(i + 1).padStart(2, '0') }))
        const { purchases: purchaseData } = await fetchMultipleMonths(currentAccount, dateRanges)
        setPurchases(purchaseData)
      } catch (err) {
        console.error("Failed to fetch purchases:", err)
        setError("Failed to load transaction data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchPurchases()
  }, [currentAccount])

  const handleRowClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
    setSheetOpen(true)
  }

  const handleExportCSV = () => {
    const filteredData = table.getFilteredRowModel().rows.map((row) => row.original)
    exportToCSV(filteredData, `transactions-${new Date().toISOString().split("T")[0]}.csv`, [
      { key: "transaction.date-time", label: "Date/Time" },
      { key: "operator.name", label: "Operator" },
      { key: "mode.id", label: "Mode" },
      { key: "transaction.price.amount", label: "Amount (pence)" },
      { key: "id", label: "Transaction ID" },
    ])
  }

  const columns: ColumnDef<Purchase>[] = useMemo(
    () => [
      {
        accessorKey: "transaction.date-time",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date/Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const transaction = row.original.transaction;
          const dateTime = transaction && typeof transaction["date-time"] === "string" ? transaction["date-time"] : null;
          return dateTime ? formatDateTime(dateTime) : "—";
        },
      },
      {
        accessorKey: "operator",
        header: "Operator",
        cell: ({ row }) => {
          const operator = row.original.operator
          const name = operator?.name || operator?.id || "Unknown"
          return <Badge variant="outline">{name}</Badge>
        },
        filterFn: (row, id, value) => {
          const operator = row.original.operator
          const name = operator?.name || operator?.id || "Unknown"
          return name.toLowerCase().includes(value.toLowerCase())
        },
      },
      {
        accessorKey: "mode",
        header: "Mode",
        cell: ({ row }) => {
          const mode = row.original.mode?.id || "unknown"
          return (
            <div className="flex items-center space-x-2">
              <span>{getModeIcon(mode)}</span>
              <Badge className={getModeColor(mode)}>{capitalizeFirst(mode)}</Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "transaction.price.amount",
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = row.original.transaction?.price?.amount
          return amount ? (
            <span className="font-medium">{formatCurrency(amount)}</span>
          ) : (
            <span className="text-gray-400">—</span>
          )
        },
      },
      {
        accessorKey: "id",
        header: "Transaction ID",
        cell: ({ row }) => (
          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{row.getValue("id")}</code>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleRowClick(row.original)
            }}
            aria-label="View transaction details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [],
  )

  const table = useReactTable({
    data: purchases,
    columns,
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
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">View and manage your transport purchases</p>
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
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            All your transport purchases for the last 3 months. Click on a row to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table Controls */}
          <div className="flex items-center py-4 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search operator..."
                value={(table.getColumn("operator")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("operator")?.setFilterValue(event.target.value)}
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
                      No transactions found.
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

      {/* Purchase Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>Complete information for this purchase</SheetDescription>
          </SheetHeader>
          {selectedPurchase && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                  <p className="text-sm mt-1">
                    {selectedPurchase.transaction && typeof selectedPurchase.transaction["date-time"] === "string"
                      ? formatDateTime(selectedPurchase.transaction["date-time"])
                      : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking Date</label>
                  <p className="text-sm mt-1">
                    {typeof selectedPurchase["booking-date-time"] === "string"
                      ? formatDateTime(selectedPurchase["booking-date-time"])
                      : "—"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Operator</label>
                  <p className="text-sm mt-1">
                    {selectedPurchase.operator?.name || selectedPurchase.operator?.id || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mode</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <span>{getModeIcon(selectedPurchase.mode?.id || "unknown")}</span>
                    <Badge className={getModeColor(selectedPurchase.mode?.id || "unknown")}>
                      {capitalizeFirst(selectedPurchase.mode?.id || "Unknown")}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-sm font-semibold mt-1">
                    {selectedPurchase.transaction?.price?.amount != null
                      ? formatCurrency(selectedPurchase.transaction.price.amount)
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="text-sm mt-1">{selectedPurchase.transaction?.price?.currency || "GBP"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1 font-mono">
                    {selectedPurchase.id}
                  </code>
                </div>
              </div>

              {/* Raw Data (dev mode only) */}
              {process.env.NEXT_PUBLIC_DEV_MODE === "true" && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500">Raw Data (Dev Mode)</label>
                  <pre className="text-xs bg-gray-50 p-3 rounded mt-2 overflow-auto max-h-40">
                    {JSON.stringify(selectedPurchase, null, 2)}
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
          purchases,
          account: selectedAccount,
          filters: columnFilters,
          sorting,
        }}
      />
    </div>
  )
}
