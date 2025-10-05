"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { AlertTriangle } from "lucide-react"

const alerts = [
  {
    id: 1,
    merchant: "Unknown Merchant - TX",
    amount: "$847.32",
    date: "Today, 2:34 PM",
    confidence: "High",
    reason: "Unusual location and amount",
  },
  {
    id: 2,
    merchant: "Premium Subscription Service",
    amount: "$299.99",
    date: "Today, 11:22 AM",
    confidence: "Medium",
    reason: "Duplicate charge detected",
  },
]

export function FraudAlerts() {
  return (
    <Card className="border border-border/60 bg-gradient-to-br from-background via-background to-amber-100/10">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="flex items-center gap-3 text-base font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <span>Fraud Alerts</span>
          <Badge className="ml-auto rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-[0.7rem] uppercase tracking-wide text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-200">
            {alerts.length} New
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Intelligence surfaced in real time for human review and intervention.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 py-4 transition-surface hover:border-amber-300/60 hover:bg-amber-100/20 dark:hover:border-amber-400/40"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground/90">{alert.merchant}</p>
                <Badge
                  variant={alert.confidence === "High" ? "destructive" : "secondary"}
                  className="rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-wide"
                >
                  {alert.confidence} Risk
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{alert.reason}</p>
              <p className="text-xs text-muted-foreground/80">{alert.date}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg font-semibold text-foreground">{alert.amount}</p>
              <Button size="sm" variant="outline" className="rounded-full px-4">
                Dispute
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
