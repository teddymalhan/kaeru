"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Calendar, RefreshCw, Sparkles, TrendingUp, Wallet, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { isSubscriptionCancelled, getCancelledMap, markSubscriptionCancelled } from "@/app/lib/subscriptions-store"
import { postJson } from "@/app/lib/api-client"
import { addActivity } from "@/app/lib/activity"

const formatCurrency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const formatDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" })

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [outcomes, setOutcomes] = useState<Record<string, { ok: boolean; status: number } | undefined>>({})

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/subscriptions`, { cache: "no-store" })
        const json = await res.json()
        const list: any[] = Array.isArray(json.items) ? json.items : []
        setSubs(list)
        setOutcomes((prev) => {
          const next = { ...prev }
          for (const s of list) if (isSubscriptionCancelled(s.id)) next[s.id] = { ok: true, status: 200 }
          return next
        })
      } finally {
        setLoading(false)
      }
    })()
    const onSync = () => {
      setOutcomes((prev) => {
        const next = { ...prev }
        for (const id of Object.keys(getCancelledMap())) next[id] = { ok: true, status: 200 }
        return next
      })
    }
    window.addEventListener("cms:subscriptions", onSync)
    return () => window.removeEventListener("cms:subscriptions", onSync)
  }, [])

  const activeSubscriptions = useMemo(() => subs.filter((s) => s.status === "active"), [subs])
  const totalMonthly = useMemo(
    () => activeSubscriptions.reduce((sum: number, s: any) => sum + s.amount, 0),
    [activeSubscriptions],
  )
  const earliestNextBilling = useMemo(
    () =>
      [...subs].sort((a, b) => new Date(a.nextBilling).getTime() - new Date(b.nextBilling).getTime())[0],
    [subs],
  )

  const handleCancel = async (s: any) => {
    if (loadingId) return
    setLoadingId(s.id)
    try {
      const res = await postJson({
        endpoint: "/api/cancelApi",
        body: { detectionItemId: s.id, userId: "user456", metadata: { merchant: s.name, amount: s.amount, date: s.nextBilling } },
      })
      setOutcomes((prev) => ({ ...prev, [s.id]: { ok: res.ok, status: res.status } }))
      if (res.ok) markSubscriptionCancelled(s.id, s)
      addActivity({
        type: "subscription",
        title: res.ok ? "Cancellation requested" : "Cancellation failed",
        description: `${s.name} (${s.id})`,
        status: res.ok ? "completed" : "error",
        data: s,
      })
    } finally {
      setLoadingId(null)
    }
  }
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/10 px-6 py-10 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-surface motion-safe:animate-fade-up sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 55%), radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--accent) 18%, transparent) 0%, transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Recurring Revenue Choreography</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Subscriptions without the sprawl</h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                Capture every renewal, forecast spend, and pause wasteful contracts in one luminous workspace.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Active Spend
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{formatCurrency.format(totalMonthly)}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Across {activeSubscriptions.length} live subscriptions</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Annualized Run Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{formatCurrency.format(totalMonthly * 12)}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Projected at current utilization</p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Upcoming Charge
                </CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {earliestNextBilling ? formatDate.format(new Date(earliestNextBilling.nextBilling)) : "—"}
                </p>
                {earliestNextBilling && (
                  <p className="mt-2 text-xs text-muted-foreground/80">
                    {earliestNextBilling.name} • {formatCurrency.format(earliestNextBilling.amount)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Stopped Contracts
                </CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{Object.keys(getCancelledMap()).length}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Marked as cancelled across the app</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Card className="rounded-3xl border-border/60 bg-background/95">
        <CardHeader className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold">Subscription Inventory</CardTitle>
            <p className="text-sm text-muted-foreground">
              Every recurring contract, centralized. Control cadence, pause instantly, or renegotiate with context.
            </p>
          </div>
          <Button variant="outline" className="rounded-full px-5">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync with bank feeds
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {subs.map((subscription) => {
            const isPaused = subscription.status === "paused"

            return (
              <div
                key={subscription.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/90 px-5 py-4 transition-surface hover:border-primary/35 hover:bg-card"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold text-foreground/90">{subscription.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-wide",
                          isPaused
                            ? "border-amber-400/40 bg-amber-500/15 text-amber-200"
                            : "border-primary/25 bg-primary/10 text-primary"
                        )}
                      >
                        {isPaused ? "Paused" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/80">
                      <span>{subscription.category}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{subscription.billing} billing</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>Next charge {formatDate.format(new Date(subscription.nextBilling))}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tracking-tight">
                      {formatCurrency.format(subscription.amount)}
                    </p>
                    <span className="text-xs text-muted-foreground/70">Renews automatically</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/60 pt-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-xs text-muted-foreground">
                    Renewal cadence powered by automation. Notify 3 days prior, escalate if payment fails.
                  </div>
                  <div className="flex items-center gap-2">
                    {outcomes[subscription.id] && !outcomes[subscription.id]?.ok && (
                      <span className="text-destructive text-xs font-semibold">
                        {`Error (${outcomes[subscription.id]?.status})`}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant={outcomes[subscription.id]?.ok ? "outline" : "destructive"}
                      className="rounded-full px-4"
                      onClick={() => handleCancel(subscription)}
                      disabled={loadingId === subscription.id || !!outcomes[subscription.id]?.ok}
                      aria-busy={loadingId === subscription.id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {outcomes[subscription.id]?.ok ? "Cancelled" : "Cancel"}
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
