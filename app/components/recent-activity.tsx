"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Phone, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "call",
    title: "Called Comcast Customer Service",
    description: "Disputing $45.99 charge",
    status: "in-progress",
    time: "5 min ago",
  },
  {
    id: 2,
    type: "success",
    title: "Netflix Subscription Cancelled",
    description: "Saved $15.99/month",
    status: "completed",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "success",
    title: "Amazon Return Initiated",
    description: "Order #123-4567890-1234567",
    status: "completed",
    time: "2 hours ago",
  },
  {
    id: 4,
    type: "pending",
    title: "Gym Membership Cancellation",
    description: "Waiting on hold - Position 3 in queue",
    status: "pending",
    time: "3 hours ago",
  },
]

const statusConfig = {
  "in-progress": {
    icon: Phone,
    badge: "In Progress",
    variant: "default" as const,
  },
  completed: {
    icon: CheckCircle2,
    badge: "Completed",
    variant: "secondary" as const,
  },
  pending: {
    icon: Clock,
    badge: "Pending",
    variant: "outline" as const,
  },
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Live chronicle of agent interventions across calls, disputes, and workflows.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const config = statusConfig[activity.status as keyof typeof statusConfig]
            const Icon = config.icon

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-2xl border border-transparent bg-background/60 px-4 py-4 transition-surface hover:border-primary/20 hover:bg-primary/10"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground/90">{activity.title}</p>
                    <Badge
                      variant={config.variant}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-wide",
                        config.variant === "outline" && "border-border/70"
                      )}
                    >
                      {config.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
