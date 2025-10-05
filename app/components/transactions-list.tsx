"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"

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
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Transactions</span>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    transaction.flagged ? "bg-destructive/10" : transaction.amount > 0 ? "bg-accent/10" : "bg-muted"
                  }`}
                >
                  {transaction.flagged ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : transaction.amount > 0 ? (
                    <TrendingUp className="h-5 w-5 text-accent" />
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
              <p className={`font-semibold ${transaction.amount > 0 ? "text-accent" : "text-foreground"}`}>
                {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
