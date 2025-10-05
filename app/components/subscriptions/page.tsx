import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Calendar, DollarSign, TrendingUp, Pause, X } from "lucide-react"

export default function SubscriptionsPage() {
  const subscriptions = [
    {
      id: "1",
      name: "Netflix Premium",
      amount: 15.99,
      billing: "monthly",
      nextBilling: "2025-10-15",
      status: "active",
      category: "Entertainment",
    },
    {
      id: "2",
      name: "Spotify Family",
      amount: 16.99,
      billing: "monthly",
      nextBilling: "2025-10-20",
      status: "active",
      category: "Music",
    },
    {
      id: "3",
      name: "Adobe Creative Cloud",
      amount: 54.99,
      billing: "monthly",
      nextBilling: "2025-10-10",
      status: "active",
      category: "Software",
    },
    {
      id: "4",
      name: "Amazon Prime",
      amount: 14.99,
      billing: "monthly",
      nextBilling: "2025-10-25",
      status: "active",
      category: "Shopping",
    },
    {
      id: "5",
      name: "ChatGPT Plus",
      amount: 20.0,
      billing: "monthly",
      nextBilling: "2025-10-18",
      status: "active",
      category: "AI Tools",
    },
    {
      id: "6",
      name: "Gym Membership",
      amount: 49.99,
      billing: "monthly",
      nextBilling: "2025-10-05",
      status: "paused",
      category: "Fitness",
    },
    {
      id: "7",
      name: "New York Times",
      amount: 17.0,
      billing: "monthly",
      nextBilling: "2025-10-12",
      status: "active",
      category: "News",
    },
    {
      id: "8",
      name: "Dropbox Plus",
      amount: 11.99,
      billing: "monthly",
      nextBilling: "2025-10-22",
      status: "active",
      category: "Storage",
    },
  ]

  const totalMonthly = subscriptions.filter((sub) => sub.status === "active").reduce((sum, sub) => sum + sub.amount, 0)

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">Manage all your recurring subscriptions in one place</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalMonthly.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {subscriptions.filter((s) => s.status === "active").length} active subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Annual Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalMonthly * 12).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Projected yearly spending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Oct 5</div>
                <p className="text-xs text-muted-foreground mt-1">Gym Membership - $49.99</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{subscription.name}</p>
                        <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                          {subscription.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{subscription.category}</span>
                        <span>•</span>
                        <span>Next billing: {subscription.nextBilling}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-lg">${subscription.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{subscription.billing}</p>
                      </div>
                      <div className="flex gap-2">
                        {subscription.status === "active" && (
                          <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                            <Pause className="h-4 w-4" />
                            Pause
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" className="gap-2">
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
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
