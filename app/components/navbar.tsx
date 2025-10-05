"use client"

import { Button } from "./ui/button"
import { Bell, Settings, User, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuthenticator } from "@aws-amplify/ui-react"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuthenticator((context) => [context.user, context.signOut])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/components/transactions", label: "Transactions" },
    { href: "/components/subscriptions", label: "Subscriptions" },
    { href: "/components/disputes", label: "Disputes" },
    { href: "/components/agent", label: "Agent Activity" },
  ]

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 pb-3">
      <div className="mx-auto w-full max-w-7xl">
        <div className="glass-surface transition-surface flex h-14 items-center justify-between rounded-full border border-border/60 bg-background/75 px-4 shadow-[var(--shadow-soft)] backdrop-blur-xl motion-safe:animate-fade-down md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight text-foreground/80 transition-opacity hover:text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/85 to-accent text-primary-foreground shadow-lg shadow-primary/30">
              CMS
            </div>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="text-sm font-semibold">Cancel My Stuff</span>
              <span className="text-xs font-medium text-muted-foreground">Account Automation</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-full px-4 text-sm font-medium text-muted-foreground hover:text-primary",
                    pathname === link.href &&
                      "bg-primary/15 text-primary shadow-none hover:bg-primary/20"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border border-transparent bg-transparent hover:border-primary/30 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden rounded-full border border-transparent bg-transparent hover:border-primary/30 hover:text-primary sm:flex"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full border border-transparent bg-transparent hover:border-primary/30 hover:text-primary sm:flex"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full border border-transparent hover:border-primary/30 hover:text-primary"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 space-y-1 rounded-2xl border border-border/70 bg-popover/95 p-2 shadow-[var(--shadow-soft)] backdrop-blur-xl"
              >
                <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                  Signed in as
                </DropdownMenuLabel>
                <div className="rounded-xl bg-muted/40 px-3 py-2 text-sm font-medium text-foreground/90">
                  {user?.signInDetails?.loginId || user?.username || "Guest"}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="glass-surface mt-3 rounded-3xl border border-border/60 bg-background/80 p-4 shadow-[var(--shadow-soft)] animate-fade-down">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={pathname === link.href ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start rounded-2xl px-4",
                        pathname === link.href && "text-primary"
                      )}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
