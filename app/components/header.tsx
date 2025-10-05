"use client"

import { Button } from "@/app/components/ui/button"
import { Bell, Settings, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-white font-bold text-sm">FA</span>
            </div>
            <span className="font-semibold text-lg text-gray-900">Financial Agent</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-gray-200 rounded-md shadow-md">
                <DropdownMenuLabel className="text-gray-700 font-medium">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="border-gray-200" />
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-100">Profile</DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-100">Settings</DropdownMenuItem>
                <DropdownMenuSeparator className="border-gray-200" />
                <DropdownMenuItem className="text-red-500 hover:bg-red-100">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
