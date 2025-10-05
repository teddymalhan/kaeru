import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { CheckCircle, Clock, Phone, FileText, Plus } from "lucide-react"

export default function DisputesPage() {
  const disputes = [
    {
      id: "1",
      merchant: "Unknown Merchant LLC",
      amount: 499.0,
      date: "2025-10-01",
      status: "in_progress",
      type: "fraud",
      description: "Unrecognized charge on credit card",
      agentStatus: "calling",
      lastUpdate: "Agent on hold with merchant - 15 min wait time",
    },
    {
      id: "2",
      merchant: "Suspicious Store XYZ",
      amount: 1200.0,
      date: "2025-09-28",
      status: "pending",
      type: "fraud",
      description: "Fraudulent transaction detected",
      agentStatus: "queued",
      lastUpdate: "Waiting to initiate call",
    },
    {
      id: "3",
      merchant: "FitnessPro Gym",
      amount: 299.0,
      date: "2025-09-20",
      status: "resolved",
      type: "cancellation",
      description: "Charged after cancellation",
      agentStatus: "completed",
      lastUpdate: "Refund processed - $299.00 credited",
    },
    {
      id: "4",
      merchant: "TechGadgets Inc",
      amount: 89.99,
      date: "2025-09-15",
      status: "in_progress",
      type: "return",
      description: "Product return not processed",
      agentStatus: "calling",
      lastUpdate: "Speaking with customer service rep",
    },
    {
      id: "5",
      merchant: "StreamMax",
      amount: 24.99,
      date: "2025-09-10",
      status: "rejected",
      type: "billing_error",
      description: "Double charged for subscription",
      agentStatus: "completed",
      lastUpdate: "Merchant denied dispute - escalating",
    },
  ]

  const stats = {
    total: disputes.length,
    inProgress: disputes.filter((d) => d.status === "in_progress").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
    pending: disputes.filter((d) => d.status === "pending").length,
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Disputes & Claims</h1>
              <p className="text-muted-foreground">Track and manage all your disputes with AI agent assistance</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Dispute
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              </CardContent>
            </Card>
          </div>

          {/* Disputes List */}
          <Card>
            <CardHeader>
              <CardTitle>All Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{dispute.merchant}</h3>
                          <Badge
                            variant={
                              dispute.status === "resolved"
                                ? "default"
                                : dispute.status === "in_progress"
                                  ? "secondary"
                                  : dispute.status === "rejected"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {dispute.status.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline">{dispute.type.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{dispute.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Amount: ${dispute.amount.toFixed(2)}</span>
                          <span>•</span>
                          <span>{dispute.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${dispute.amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Agent Status */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        {dispute.agentStatus === "calling" && (
                          <>
                            <Phone className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-sm font-medium text-primary">Agent Active</span>
                          </>
                        )}
                        {dispute.agentStatus === "queued" && (
                          <>
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-600">Queued</span>
                          </>
                        )}
                        {dispute.agentStatus === "completed" && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Completed</span>
                          </>
                        )}
                        <span className="text-sm text-muted-foreground">• {dispute.lastUpdate}</span>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                        <FileText className="h-4 w-4" />
                        View Details
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
