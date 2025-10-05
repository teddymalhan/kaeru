import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { AlertTriangle, CheckCircle, Search, Filter, Download } from "lucide-react"

export default function TransactionsPage() {
  const transactions = [
    {
      id: "1",
      merchant: "Amazon",
      amount: 156.99,
      date: "2025-10-03",
      status: "completed",
      category: "Shopping",
      fraudScore: 5,
    },
    {
      id: "2",
      merchant: "Netflix",
      amount: 15.99,
      date: "2025-10-02",
      status: "completed",
      category: "Entertainment",
      fraudScore: 2,
    },
    {
      id: "3",
      merchant: "Unknown Merchant LLC",
      amount: 499.0,
      date: "2025-10-01",
      status: "flagged",
      category: "Unknown",
      fraudScore: 92,
    },
    {
      id: "4",
      merchant: "Whole Foods",
      amount: 87.43,
      date: "2025-09-30",
      status: "completed",
      category: "Groceries",
      fraudScore: 3,
    },
    {
      id: "5",
      merchant: "Shell Gas Station",
      amount: 65.0,
      date: "2025-09-29",
      status: "completed",
      category: "Gas",
      fraudScore: 8,
    },
    {
      id: "6",
      merchant: "Suspicious Store XYZ",
      amount: 1200.0,
      date: "2025-09-28",
      status: "flagged",
      category: "Unknown",
      fraudScore: 88,
    },
    {
      id: "7",
      merchant: "Apple Store",
      amount: 299.0,
      date: "2025-09-27",
      status: "completed",
      category: "Electronics",
      fraudScore: 4,
    },
    {
      id: "8",
      merchant: "Starbucks",
      amount: 12.5,
      date: "2025-09-26",
      status: "completed",
      category: "Food & Drink",
      fraudScore: 1,
    },
    {
      id: "9",
      merchant: "Target",
      amount: 143.22,
      date: "2025-09-25",
      status: "completed",
      category: "Shopping",
      fraudScore: 6,
    },
    {
      id: "10",
      merchant: "Uber",
      amount: 28.75,
      date: "2025-09-24",
      status: "completed",
      category: "Transportation",
      fraudScore: 3,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
              <p className="text-muted-foreground">Monitor all your transactions with AI-powered fraud detection</p>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
                    />
                  </div>
                </div>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{transaction.merchant}</p>
                          {transaction.fraudScore > 70 && (
                            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.date}</span>
                          <span>•</span>
                          <span>{transaction.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${transaction.amount.toFixed(2)}</p>
                        {transaction.status === "flagged" ? (
                          <Badge
                            className={`mt-1 ${
                              transaction.fraudScore > 70
                                ? "badge-high-risk"
                                : transaction.fraudScore > 30
                                ? "badge-medium-risk"
                                : "badge-low-risk"
                            }`}
                          >
                            Fraud Risk: {transaction.fraudScore}%
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {transaction.status === "flagged" && (
                        <Button size="sm" variant="destructive">
                          Dispute
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
