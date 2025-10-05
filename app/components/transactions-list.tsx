"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Txn = { id: string; merchant: string; amount: number; date: string; category: string; status: string; fraudScore: number }

export function TransactionsList() {
  const [items, setItems] = useState<Txn[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/transactions", { cache: "no-store" })
        const json = await res.json()
        setItems(Array.isArray(json.items) ? json.items : [])
      } catch {
        setItems([])
      }
    })()
  }, [])
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>Recent Transactions</span>
          <Button asChild variant="ghost" size="sm" className="rounded-full px-4">
            <Link href="/components/transactions">View All</Link>
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Follow the latest revenue and refunds processed by your agents.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-transparent bg-background/50 px-4 py-3 transition-surface hover:border-primary/25 hover:bg-primary/10"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    transaction.status === "flagged"
                      ? "bg-destructive/10 text-destructive"
                      : transaction.amount > 0
                        ? "bg-emerald-100/40 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {transaction.status === "flagged" ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : transaction.amount > 0 ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{transaction.merchant}</p>
                    {transaction.status === "flagged" && (
                      <Badge variant="destructive" className="text-xs">
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p
                className={cn(
                  "font-semibold tabular-nums",
                  transaction.amount > 0
                    ? "text-emerald-600 dark:text-emerald-300"
                    : "text-foreground"
                )}
              >
                {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
