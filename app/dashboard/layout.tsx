"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DEMO_ACCOUNTS } from "@/lib/demo-data"
import { loadCurrentAccount } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CreditCard, Home, Route, Users, ChevronDown, LogOut, Menu, Train } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: Home },
  { name: "Journeys", href: "/dashboard/journeys", icon: Route },
  { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { name: "Accounts", href: "/dashboard/accounts", icon: Users },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const selectedAccount = DEMO_ACCOUNTS.find((acc) => acc.account_id === currentAccount)

  useEffect(() => {
    const accountId = loadCurrentAccount()
    if (!accountId) {
      router.push("/")
      return
    }
    setCurrentAccount(accountId)
  }, [router])

  const handleAccountSwitch = (accountId: string) => {
    setCurrentAccount(accountId)
    // Note: In a real app, this would trigger a data refresh
    router.refresh()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center space-x-3 px-6 py-4 border-b">
        <div className="bg-openTransport-primary/10 p-2 rounded-lg">
          <Train className="h-5 w-5 text-openTransport-primary" />
        </div>
        <span className="font-bold text-lg text-openTransport-neutral">Open Transport</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-openTransport-primary text-white" : "text-gray-700 hover:bg-gray-100",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={selectedAccount?.avatar || "/placeholder.svg"} alt={selectedAccount?.name} />
                <AvatarFallback className="text-xs">
                  {selectedAccount?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium truncate">{selectedAccount?.name || "Loading..."}</div>
                <div className="text-xs text-gray-500 truncate">{selectedAccount?.account_id?.slice(-8)}</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">Switch Account</div>
            <DropdownMenuSeparator />
            {DEMO_ACCOUNTS.filter((acc) => acc.account_id !== currentAccount).map((account) => (
              <DropdownMenuItem
                key={account.id}
                onClick={() => handleAccountSwitch(account.account_id)}
                className="cursor-pointer"
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={account.avatar || "/placeholder.svg"} alt={account.name} />
                  <AvatarFallback className="text-xs">
                    {account.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm">{account.name}</div>
                  <div className="text-xs text-gray-500">{account.account_id.slice(-8)}</div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  if (!selectedAccount) {
    return (
      <div className="min-h-screen bg-openTransport-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-openTransport-primary mx-auto mb-4"></div>
          <p>Loading account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-openTransport-background">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
            <SidebarContent />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
                <div className="text-sm text-gray-600">Dashboard</div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
