"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { postJson } from "@/app/lib/api-client"
import { markSubscriptionCancelled, isSubscriptionCancelled } from "@/app/lib/subscriptions-store"
import { addActivity } from "@/app/lib/activity"

type Sub = { id: string; name: string; amount: number; billing?: string; nextBilling: string; status: string }

export function SubscriptionsList() {
  const [items, setItems] = useState<Sub[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [outcomes, setOutcomes] = useState<Record<string, { ok: boolean; status: number } | undefined>>({})
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/subscriptions", { cache: "no-store" })
        const json = await res.json()
        const list: Sub[] = Array.isArray(json.items) ? json.items : []
        setItems(list)
        setOutcomes((prev) => {
          const next = { ...prev }
          for (const s of list) if (isSubscriptionCancelled(s.id)) next[s.id] = { ok: true, status: 200 }
          return next
        })
      } catch {
        setItems([])
      }
    })()
    const onSync = () => {
      setOutcomes((prev) => {
        const next = { ...prev }
        for (const s of items) if (isSubscriptionCancelled(s.id)) next[s.id] = { ok: true, status: 200 }
        return next
      })
    }
    window.addEventListener("cms:subscriptions", onSync)
    return () => window.removeEventListener("cms:subscriptions", onSync)
  }, [])

  const handleCancel = async (s: Sub) => {
    if (loadingId) return
    setLoadingId(s.id)
    try {
      const res = await postJson({
        endpoint: "/api/cancelApi",
        body: {
          detectionItemId: s.id,
          userId: "user456",
          metadata: { merchant: s.name, amount: s.amount, date: s.nextBilling },
        },
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
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>Active Subscriptions</span>
          <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {`$${items.filter((s) => !isSubscriptionCancelled(s.id)).reduce((sum, sub) => sum + sub.amount, 0).toFixed(2)}/mo`}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">View active subscriptions and cancel when needed.</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((subscription) => (
            <div
              key={subscription.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-transparent bg-background/50 px-4 py-3 transition-surface hover:border-primary/25 hover:bg-primary/10"
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-medium text-sm">{subscription.name}</p>
                  {((outcomes[subscription.id]?.ok) || isSubscriptionCancelled(subscription.id)) ? (
                    <Badge
                      variant="outline"
                      className="rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-destructive"
                    >
                      Cancelled
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-primary"
                    >
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold tabular-nums text-foreground/90">
                  ${subscription.amount.toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  {outcomes[subscription.id] && !outcomes[subscription.id]?.ok && (
                    <span className="text-destructive text-xs font-semibold">
                      {`Error (${outcomes[subscription.id]?.status})`}
                    </span>
                  )}
                  <Button
                    variant={outcomes[subscription.id]?.ok ? "outline" : "outline"}
                    size="icon"
                    className={cn(
                      "rounded-full border-border/60",
                      outcomes[subscription.id]?.ok && "opacity-50"
                    )}
                    onClick={() => handleCancel(subscription)}
                    disabled={loadingId === subscription.id || !!outcomes[subscription.id]?.ok}
                    aria-busy={loadingId === subscription.id}
                    title={outcomes[subscription.id]?.ok ? "Cancelled" : "Cancel subscription"}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
