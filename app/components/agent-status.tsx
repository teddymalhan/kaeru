"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Phone, Clock, CheckCircle2 } from "lucide-react"

export function AgentStatus() {
  const [data, setData] = useState<{ activeCalls: any[]; queuedTasks: any[]; completedToday: any[] } | null>(null)
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/agent", { cache: "no-store" })
        const json = await res.json()
        setData(json)
      } catch {
        setData({ activeCalls: [], queuedTasks: [], completedToday: [] })
      }
    })()
  }, [])

  const first = data?.activeCalls?.[0]
  const queue = data?.queuedTasks?.length ?? 0
  const done = data?.completedToday?.length ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <span>Agent Status</span>
          <Badge className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/15 px-3 py-1 text-[0.7rem] uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-gradient-to-tr from-primary/12 via-background/60 to-background px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{first ? "On Call" : "Idle"}</p>
              <p className="text-xs text-muted-foreground">{first?.merchant ?? "No active calls"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-semibold tabular-nums">{first?.duration ?? "—"}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/50 bg-background/80 px-3 py-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Queue</p>
            <p className="mt-2 text-2xl font-semibold">{queue}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/80 px-3 py-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Completed</p>
            <p className="mt-2 text-2xl font-semibold">{done}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/80 px-3 py-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Hours Saved</p>
            <p className="mt-2 text-2xl font-semibold">2.5h</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Status updates reflect live calls</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
