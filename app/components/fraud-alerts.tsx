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
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span>Fraud Alerts</span>
          <Badge variant="secondary" className="ml-auto">
            {alerts.length} New
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start justify-between p-4 rounded-lg bg-card border">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{alert.merchant}</p>
                <Badge variant={alert.confidence === "High" ? "destructive" : "secondary"} className="text-xs">
                  {alert.confidence} Risk
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{alert.reason}</p>
              <p className="text-xs text-muted-foreground">{alert.date}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-lg font-bold">{alert.amount}</p>
              <Button size="sm" variant="outline">
                Dispute
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
