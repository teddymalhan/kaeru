"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Phone, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getActivities } from "@/app/lib/activity"

type Activity = {
  id: number
  type: string
  title: string
  description: string
  status: "in-progress" | "completed" | "pending" | "error"
  time: string
  data?: any
}

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
  error: {
    icon: XCircle,
    badge: "Error",
    variant: "destructive" as const,
  },
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    // Prefer live activity captured in the app; fall back to seed endpoint
    const fromLocal = getActivities().map((a) => ({
      id: Number(a.timestamp),
      type: a.type,
      title: a.title,
      description: a.description,
      status: (a.status as any) ?? "completed",
      time: new Date(a.timestamp).toLocaleTimeString(),
      data: (a as any).data,
    })) as Activity[]
    if (fromLocal.length) setActivities(fromLocal)
    ;(async () => {
      if (fromLocal.length) return
      try {
        const res = await fetch("/api/recent-activity", { cache: "no-store" })
        const json = await res.json()
        setActivities(Array.isArray(json.items) ? json.items : [])
      } catch {
        setActivities([])
      }
    })()
    const onStorage = () => {
      const next = getActivities().map((a) => ({
        id: Number(a.timestamp),
        type: a.type,
        title: a.title,
        description: a.description,
        status: (a.status as any) ?? "completed",
        time: new Date(a.timestamp).toLocaleTimeString(),
        data: (a as any).data,
      })) as Activity[]
      if (next.length) setActivities(next)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          {activities.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-3"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Collapse" : "View All"}
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Live chronicle of agent interventions across calls, disputes, and workflows.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(showAll ? activities : activities.slice(0, 5)).map((activity, i) => {
            const config =
              statusConfig[activity.status as keyof typeof statusConfig] ?? statusConfig["in-progress"]
            const Icon = config.icon

            const TypeIcon =
              activity.type === "dispute" ? AlertTriangle : activity.type === "subscription" ? XCircle : Phone

            const tone =
              activity.status === "completed"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : activity.status === "pending"
                  ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                  : activity.status === "error"
                    ? "border-destructive/40 bg-destructive/20 text-destructive"
                    : "border-primary/30 bg-primary/10 text-primary"

            return (
              <div
                key={activity.id}
                className="grid grid-cols-[16px_1fr] gap-3 rounded-2xl border border-border/60 bg-background/70 px-4 py-4 transition-surface hover:border-primary/25 hover:bg-primary/10"
              >
                {/* timeline dot */}
                <div className="flex items-start justify-center pt-1">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full ring-4",
                      activity.status === "completed" && "bg-emerald-400 ring-emerald-400/15",
                      activity.status === "pending" && "bg-amber-300 ring-amber-300/20",
                      activity.status === "error" && "bg-destructive ring-destructive/25",
                      activity.status === "in-progress" && "bg-primary ring-primary/20",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15", tone)}>
                        <TypeIcon className={cn("h-4 w-4")} />
                      </span>
                      <p className="text-sm font-medium text-foreground/90">{activity.title}</p>
                      <Badge
                        variant={config.variant}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-wide",
                          config.variant === "outline" && "border-border/70",
                          tone,
                        )}
                      >
                        {config.badge}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground/70 whitespace-nowrap">{activity.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  {activity.type === "dispute" && activity.data && (
                    <div className="mt-2 rounded-xl border border-border/60 bg-background/70 p-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                        {activity.data.merchant && (
                          <span className="mr-1 font-medium text-foreground/90">{activity.data.merchant}</span>
                        )}
                        {typeof activity.data.amount !== "undefined" && (
                          <span className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5">
                            {typeof activity.data.amount === "number"
                              ? `$${activity.data.amount.toFixed(2)}`
                              : activity.data.amount}
                          </span>
                        )}
                        {activity.data.date && (
                          <span className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5">
                            {new Date(activity.data.date).toLocaleDateString?.() ?? activity.data.date}
                          </span>
                        )}
                        {activity.data.category && (
                          <span className="rounded-full border border-border/60 bg-background/80 px-2 py-0.5">
                            {activity.data.category}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
