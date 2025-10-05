import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Phone, Clock, CheckCircle, XCircle, Activity, TrendingUp } from "lucide-react"

export default function AgentPage() {
  const activeCalls = [
    {
      id: "1",
      merchant: "Unknown Merchant LLC",
      type: "Fraud Dispute",
      status: "on_hold",
      duration: "15:32",
      waitTime: "12 min",
      priority: "high",
    },
    {
      id: "2",
      merchant: "TechGadgets Inc",
      type: "Return Processing",
      status: "speaking",
      duration: "8:45",
      waitTime: "0 min",
      priority: "medium",
    },
  ]

  const queuedTasks = [
    { id: "3", merchant: "Suspicious Store XYZ", type: "Fraud Dispute", priority: "high", estimatedWait: "5 min" },
    { id: "4", merchant: "StreamMax", type: "Subscription Cancel", priority: "medium", estimatedWait: "15 min" },
    { id: "5", merchant: "FitnessPro", type: "Billing Dispute", priority: "low", estimatedWait: "25 min" },
  ]

  const completedToday = [
    { id: "6", merchant: "FitnessPro Gym", type: "Cancellation", result: "success", duration: "12:30", amount: 299.0 },
    { id: "7", merchant: "Cable Company", type: "Password Reset", result: "success", duration: "18:45", amount: 0 },
    { id: "8", merchant: "Insurance Co", type: "Claim Dispute", result: "failed", duration: "25:12", amount: 450.0 },
    { id: "9", merchant: "Phone Provider", type: "Bill Dispute", result: "success", duration: "15:20", amount: 85.0 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">AI Agent Activity</h1>
            <p className="text-muted-foreground">Monitor your AI agent's calls and task queue in real-time</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
                <Phone className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{activeCalls.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Queued Tasks</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{queuedTasks.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Waiting to start</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedToday.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Tasks finished</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">75%</div>
                <p className="text-xs text-muted-foreground mt-1">Today's completion rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Calls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Active Calls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCalls.map((call) => (
                  <div key={call.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{call.merchant}</h3>
                          <Badge variant={call.priority === "high" ? "destructive" : "secondary"}>
                            {call.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{call.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-lg font-bold">{call.duration}</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        {call.status === "on_hold" ? (
                          <>
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-600">On Hold</span>
                            <span className="text-sm text-muted-foreground">• Wait time: {call.waitTime}</span>
                          </>
                        ) : (
                          <>
                            <Phone className="h-4 w-4 text-primary animate-pulse" />
                            <span className="text-sm font-medium text-primary">Speaking with Rep</span>
                          </>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        View Transcript
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Queued Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Queued Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queuedTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{task.merchant}</p>
                        <p className="text-sm text-muted-foreground">{task.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Est. {task.estimatedWait}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completed Today */}
          <Card>
            <CardHeader>
              <CardTitle>Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedToday.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 flex-1">
                      {task.result === "success" ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.merchant}</p>
                        <p className="text-sm text-muted-foreground">{task.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{task.duration}</p>
                        {task.amount > 0 && <p className="text-xs text-green-600">+${task.amount.toFixed(2)}</p>}
                      </div>
                      <Badge variant={task.result === "success" ? "default" : "destructive"}>{task.result}</Badge>
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
