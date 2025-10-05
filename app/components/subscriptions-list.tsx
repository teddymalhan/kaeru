"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Sub = { id: string; name: string; amount: number; billing?: string; nextBilling: string; status: string }

export function SubscriptionsList() {
  const [items, setItems] = useState<Sub[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/subscriptions", { cache: "no-store" })
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
          <span>Active Subscriptions</span>
          <div className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {`$${items.reduce((sum, sub) => sum + sub.amount, 0).toFixed(2)}/mo`}
          </div>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Track recurring spend and proactively cancel stale services.</p>
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
                  {subscription.status === "cancelling" && (
                    <Badge
                      variant="outline"
                      className="rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-destructive"
                    >
                      Cancelling
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold tabular-nums text-foreground/90">
                  ${subscription.amount.toFixed(2)}
                </p>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "rounded-full border-border/60",
                    subscription.status === "cancelling" && "opacity-50"
                  )}
                  disabled={subscription.status === "cancelling"}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
