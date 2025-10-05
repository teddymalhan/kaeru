import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { AlertTriangle, CheckCircle2, Download, Filter, Search, ShieldCheck, Sparkles, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const formatDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

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
    amount: 499,
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
    amount: 65,
    date: "2025-09-29",
    status: "completed",
    category: "Gas",
    fraudScore: 8,
  },
  {
    id: "6",
    merchant: "Suspicious Store XYZ",
    amount: 1200,
    date: "2025-09-28",
    status: "flagged",
    category: "Unknown",
    fraudScore: 88,
  },
  {
    id: "7",
    merchant: "Apple Store",
    amount: 299,
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

const flaggedTransactions = transactions.filter((transaction) => transaction.status === "flagged")
const totalVolume = transactions.reduce((acc, transaction) => acc + transaction.amount, 0)
const averageTicket = totalVolume / transactions.length
const highestRisk = flaggedTransactions.reduce(
  (max, current) => (current && max && current.fraudScore > max.fraudScore ? current : max),
  flaggedTransactions[0],
)

const riskTone = (score: number) => {
  if (score >= 80) {
    return "border-red-500/30 bg-red-500/15 text-red-200"
  }
  if (score >= 40) {
    return "border-amber-400/25 bg-amber-500/15 text-amber-200"
  }
  return "border-emerald-400/20 bg-emerald-500/15 text-emerald-200"
}

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/10 px-6 py-10 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-surface motion-safe:animate-fade-up sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 55%), radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Transaction Intelligence</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Every swipe, reconciled beautifully</h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                Observe spend in real time, silence fraud faster, and export pristine ledgers with a single tap. Your
                finance cockpit, choreographed for decisive teams.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="rounded-full px-6">
                <Download className="mr-2 h-4 w-4" />
                Export Ledger
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-6">
                Create Report
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Total Volume
                </CardTitle>
                <Wand2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{formatCurrency.format(totalVolume)}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">10 transactions processed in the last 7 days</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Flagged Cases
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{flaggedTransactions.length}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">
                  {highestRisk ? `${highestRisk.fraudScore}% peak risk score` : "All clear"}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Avg. Ticket Size
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{formatCurrency.format(averageTicket)}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Smoothed across all channels</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Auto-Approved
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {transactions.length - flaggedTransactions.length}
                </p>
                <p className="mt-2 text-xs text-muted-foreground/80">Cleared instantly by the AI auditor</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Card className="rounded-3xl border-border/60 bg-background/95">
        <CardHeader className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold">Universal Ledger</CardTitle>
            <p className="text-sm text-muted-foreground">
              Search, filter, and orchestrate follow-ups without ever leaving your cockpit.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input
                type="search"
                placeholder="Search by merchant, category, or amount"
                className="h-11 w-full rounded-full border border-border/60 bg-background/70 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button
              variant="outline"
              className="w-full rounded-full border-border/60 bg-background/70 px-4 text-sm font-semibold sm:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.map((transaction) => {
            const isFlagged = transaction.status === "flagged"

            return (
              <div
                key={transaction.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/90 px-5 py-4 transition-surface hover:border-primary/35 hover:bg-card"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-3 text-sm font-semibold text-foreground/90">
                      <span className="truncate text-base font-semibold">{transaction.merchant}</span>
                      <Badge
                        variant={isFlagged ? "destructive" : "outline"}
                        className={cn(
                          "rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-wide",
                          !isFlagged && "border-primary/30 text-primary"
                        )}
                      >
                        {isFlagged ? "Needs review" : "Cleared"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/80">
                      <span>{transaction.category}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{formatDate.format(new Date(transaction.date))}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>ID {transaction.id.padStart(4, "0")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tracking-tight">
                      {transaction.amount >= 0 ? "+" : ""}
                      {formatCurrency.format(transaction.amount)}
                    </p>
                    {!isFlagged && (
                      <span className="text-xs text-muted-foreground/70">Verified by autonomous auditor</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/60 pt-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn("rounded-full border px-3 py-1 text-xs font-medium", riskTone(transaction.fraudScore))}
                    >
                      Fraud score {transaction.fraudScore}%
                    </Badge>
                    {isFlagged ? (
                      <span className="text-xs font-semibold text-destructive">Autonomous hold applied</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-400" />
                        Auto-completed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isFlagged && (
                      <Button size="sm" variant="destructive" className="rounded-full px-4">
                        Escalate
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="rounded-full px-4">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
