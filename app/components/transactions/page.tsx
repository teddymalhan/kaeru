"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

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


type Txn = {
  id: string
  merchant: string
  amount: number
  date: string
  status: string
  category: string
  fraudScore: number
}

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
  const [items, setItems] = useState<Txn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/transactions", { cache: "no-store" })
        const json = await res.json()
        if (!mounted) return
        setItems(Array.isArray(json.items) ? json.items : [])
      } catch (e) {
        if (!mounted) return
        setItems([])
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const flaggedTransactions = useMemo(() => items.filter((t) => t.status === "flagged"), [items])
  const totalVolume = useMemo(() => items.reduce((acc, t) => acc + t.amount, 0), [items])
  const averageTicket = useMemo(() => (items.length ? totalVolume / items.length : 0), [items, totalVolume])
  const highestRisk = useMemo(
    () => (flaggedTransactions.length ? flaggedTransactions.reduce((max, cur) => (cur.fraudScore > max.fraudScore ? cur : max)) : null),
    [flaggedTransactions],
  )
  const handleExport = useCallback(() => {
    const headers = ["Transaction ID", "Merchant", "Category", "Date", "Amount", "Status", "Fraud Score"]
    const rows = items.map((transaction) => [
      transaction.id,
      transaction.merchant,
      transaction.category,
      formatDate.format(new Date(transaction.date)),
      transaction.amount.toFixed(2),
      transaction.status,
      `${transaction.fraudScore}%`,
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const timestamp = new Date().toISOString().split("T")[0]

    link.href = url
    link.setAttribute("download", `cms-transactions-${timestamp}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [items])

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
              <Button size="lg" className="rounded-full px-6" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Ledger
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-6"
                onClick={() => {
                  const title = "Cancel My Stuff — Transaction Report"
                  const today = new Date()
                  const formattedDate = today.toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  const topMerchants = [...items]
                    .reduce<Record<string, number>>((acc, t) => {
                      acc[t.merchant] = (acc[t.merchant] ?? 0) + t.amount
                      return acc
                    }, {})
                  const merchantRows = Object.entries(topMerchants)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, amt]) => `
                      <tr>
                        <td>${name}</td>
                        <td style="text-align:right">${formatCurrency.format(amt)}</td>
                      </tr>
                    `)
                    .join("")

                  const txnRows = items
                    .map(
                      (t) => `
                        <tr>
                          <td>${t.id}</td>
                          <td>${t.merchant}</td>
                          <td>${t.category}</td>
                          <td>${formatDate.format(new Date(t.date))}</td>
                          <td style="text-align:right">${formatCurrency.format(t.amount)}</td>
                          <td>${t.status}</td>
                          <td>${t.fraudScore}%</td>
                        </tr>
                      `,
                    )
                    .join("")

                  const html = `<!doctype html>
                    <html>
                      <head>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1" />
                        <title>${title}</title>
                        <style>
                          :root {
                            --ink: #0a0c10;
                            --muted: #5b6472;
                            --border: #e5e7eb;
                            --primary: #5a66ff;
                          }
                          @page { margin: 24mm; }
                          * { box-sizing: border-box; }
                          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif; color: var(--ink); }
                          .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 18px; }
                          .brand { display:flex; align-items:center; gap:12px; }
                          .logo { width:28px; height:28px; border-radius:10px; background: linear-gradient(135deg, var(--primary) 0%, #9aa2ff 100%); color:white; display:grid; place-items:center; font-weight:700; }
                          h1 { font-size: 22px; margin: 0; letter-spacing: -0.01em; }
                          .muted { color: var(--muted); font-size: 12px; }
                          .kpis { display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin: 18px 0 10px; }
                          .kpi { border:1px solid var(--border); border-radius:12px; padding:12px; }
                          .kpi .label { font-size:11px; color: var(--muted); text-transform: uppercase; letter-spacing: .12em; }
                          .kpi .value { font-size:18px; font-weight:700; margin-top:6px; }
                          h2 { font-size: 14px; margin: 18px 0 8px; letter-spacing: .02em; }
                          table { width:100%; border-collapse: collapse; }
                          th, td { padding: 8px 10px; border-bottom: 1px solid var(--border); font-size: 12px; }
                          th { text-align: left; font-weight: 600; color: var(--muted); text-transform: uppercase; font-size: 11px; letter-spacing: .08em; }
                          .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                          .card { border:1px solid var(--border); border-radius: 12px; padding: 14px; }
                          footer { margin-top: 18px; font-size: 11px; color: var(--muted); display:flex; justify-content:space-between; }
                        </style>
                      </head>
                      <body>
                        <div class="header">
                          <div class="brand">
                            <div class="logo">CMS</div>
                            <div>
                              <h1>Transaction Report</h1>
                              <div class="muted">Generated ${formattedDate}</div>
                            </div>
                          </div>
                        </div>

                        <div class="kpis">
                          <div class="kpi"><div class="label">Total Volume</div><div class="value">${formatCurrency.format(totalVolume)}</div></div>
                          <div class="kpi"><div class="label">Flagged Cases</div><div class="value">${flaggedTransactions.length}</div></div>
                          <div class="kpi"><div class="label">Avg Ticket</div><div class="value">${formatCurrency.format(averageTicket)}</div></div>
                        </div>

                        <div class="grid">
                          <div class="card">
                            <h2>Top Merchants</h2>
                            <table>
                              <thead>
                                <tr><th>Merchant</th><th style="text-align:right">Amount</th></tr>
                              </thead>
                              <tbody>${merchantRows}</tbody>
                            </table>
                          </div>
                          <div class="card">
                            <h2>Risk Overview</h2>
                            <table>
                              <tbody>
                                <tr><td>Highest Fraud Score</td><td style="text-align:right">${flaggedTransactions.length ? Math.max(...flaggedTransactions.map(t => t.fraudScore)) : 0}%</td></tr>
                                <tr><td>Auto-Approved</td><td style="text-align:right">${items.length - flaggedTransactions.length}</td></tr>
                                <tr><td>Flag Rate</td><td style="text-align:right">${((flaggedTransactions.length / items.length) * 100).toFixed(1)}%</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div class="card" style="margin-top:16px;">
                          <h2>Ledger Detail</h2>
                          <table>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Merchant</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th style="text-align:right">Amount</th>
                                <th>Status</th>
                                <th>Fraud</th>
                              </tr>
                            </thead>
                            <tbody>${txnRows}</tbody>
                          </table>
                        </div>

                        <footer>
                          <span>Cancel My Stuff</span>
                          <span>Confidential · ${today.getFullYear()}</span>
                        </footer>
                        <script>
                          window.addEventListener('load', () => {
                            setTimeout(() => { window.print(); }, 150);
                          });
                        </script>
                      </body>
                    </html>`

                  const report = window.open("", "_blank")
                  if (!report) {
                    alert("Please allow pop-ups to generate the PDF report.")
                    return
                  }
                  report.document.open()
                  report.document.write(html)
                  report.document.close()
                }}
              >
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
                <p className="mt-2 text-xs text-muted-foreground/80">{items.length} transactions processed in the last 7 days</p>
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
                  {items.length - flaggedTransactions.length}
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
          {(loading ? [] : items).map((transaction) => {
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
