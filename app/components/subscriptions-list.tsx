"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { XCircle } from "lucide-react"

const subscriptions = [
  {
    id: 1,
    name: "Netflix Premium",
    amount: 15.99,
    frequency: "monthly",
    nextBilling: "Dec 15, 2024",
    status: "active",
  },
  {
    id: 2,
    name: "Spotify Family",
    amount: 16.99,
    frequency: "monthly",
    nextBilling: "Dec 18, 2024",
    status: "active",
  },
  {
    id: 3,
    name: "Adobe Creative Cloud",
    amount: 54.99,
    frequency: "monthly",
    nextBilling: "Dec 20, 2024",
    status: "active",
  },
  {
    id: 4,
    name: "Planet Fitness",
    amount: 24.99,
    frequency: "monthly",
    nextBilling: "Dec 12, 2024",
    status: "cancelling",
  },
]

export function SubscriptionsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Subscriptions</span>
          <div className="text-sm font-normal text-muted-foreground">
            ${subscriptions.reduce((sum, sub) => sum + sub.amount, 0).toFixed(2)}/mo
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{subscription.name}</p>
                  {subscription.status === "cancelling" && (
                    <Badge variant="outline" className="text-xs">
                      Cancelling
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Next billing: {subscription.nextBilling}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-semibold">${subscription.amount.toFixed(2)}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={subscription.status === "cancelling"}>
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
