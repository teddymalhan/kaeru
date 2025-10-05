"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Phone, CheckCircle2, Clock } from "lucide-react"

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
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const config = statusConfig[activity.status as keyof typeof statusConfig]
            const Icon = config.icon

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <Badge variant={config.variant} className="text-xs">
                      {config.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
