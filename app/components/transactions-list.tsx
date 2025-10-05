"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const transactions = [
  {
    id: 1,
    merchant: "Unknown Merchant",
    amount: -847.32,
    date: "Dec 10, 2024",
    category: "Other",
    flagged: true,
  },
  {
    id: 2,
    merchant: "Amazon.com",
    amount: -124.99,
    date: "Dec 9, 2024",
    category: "Shopping",
    flagged: false,
  },
  {
    id: 3,
    merchant: "Salary Deposit",
    amount: 3500.0,
    date: "Dec 8, 2024",
    category: "Income",
    flagged: false,
  },
  {
    id: 4,
    merchant: "Netflix",
    amount: -15.99,
    date: "Dec 7, 2024",
    category: "Entertainment",
    flagged: false,
  },
  {
    id: 5,
    merchant: "Starbucks",
    amount: -8.45,
    date: "Dec 7, 2024",
    category: "Food",
    flagged: false,
  },
]

export function TransactionsList() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>Recent Transactions</span>
          <Button variant="ghost" size="sm" className="rounded-full px-4">
            View All
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Follow the latest revenue and refunds processed by your agents.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-transparent bg-background/50 px-4 py-3 transition-surface hover:border-primary/25 hover:bg-primary/10"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl",
                    transaction.flagged
                      ? "bg-destructive/10 text-destructive"
                      : transaction.amount > 0
                        ? "bg-emerald-100/40 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {transaction.flagged ? (
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
                    {transaction.flagged && (
                      <Badge variant="destructive" className="text-xs">
                        Flagged
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category} • {transaction.date}
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
