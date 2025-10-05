import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Activity,
  CheckCircle2,
  Clock,
  Headset,
  Phone,
  PlayCircle,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { headers } from "next/headers"

const priorityTone: Record<string, string> = {
  high: "border-destructive/40 bg-destructive/20 text-destructive",
  medium: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  low: "border-primary/30 bg-primary/10 text-primary",
}

type AgentData = {
  activeCalls: Array<{ id: string; merchant: string; type: string; status: string; duration: string; waitTime: string; priority: string }>
  queuedTasks: Array<{ id: string; merchant: string; type: string; priority: string; estimatedWait: string }>
  completedToday: Array<{ id: string; merchant: string; type: string; result: string; duration: string; amount: number }>
  successRate: number
}

async function getAgentData(): Promise<AgentData> {
  const h = headers()
  const host = h.get("x-forwarded-host") ?? h.get("host")
  const proto = h.get("x-forwarded-proto") ?? "http"
  const base = process.env.NEXT_PUBLIC_BASE_URL || (host ? `${proto}://${host}` : "http://localhost:3000")
  const res = await fetch(`${base}/api/agent`, { cache: "no-store" })
  return res.json()
}

export default async function AgentPage() {
  const { activeCalls, queuedTasks, completedToday, successRate } = await getAgentData()
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/10 px-6 py-10 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-surface motion-safe:animate-fade-up sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 20% 25%, color-mix(in srgb, var(--primary) 20%, transparent) 0%, transparent 55%), radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Agent Activity</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Monitor active and queued calls</h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                See current calls, queue depth, and completion details. Data updates in real time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="rounded-full px-6">
                <PlayCircle className="mr-2 h-4 w-4" />
                Start session
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Active Calls
                </CardTitle>
                <Headset className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-primary">{activeCalls.length}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Currently handled by the agent</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Queue Depth
                </CardTitle>
                <Clock className="h-4 w-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-amber-300">{queuedTasks.length}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Awaiting merchant connections</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Completed Today
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-emerald-400">{completedToday.length}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Records enriched in the last 24h</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Success Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{successRate}%</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Of today’s automations closed with wins</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Card className="rounded-3xl border-border/60 bg-background/95">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Live Call Deck
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeCalls.map((call) => (
            <div
              key={call.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/90 px-5 py-4 transition-surface hover:border-primary/35 hover:bg-card"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-foreground/90">{call.merchant}</span>
                    <Badge className={cn("rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-wide", priorityTone[call.priority])}>
                      {call.priority} priority
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{call.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-semibold text-foreground">{call.duration}</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-border/60 pt-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {call.status === "on_hold" ? (
                    <>
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span className="font-semibold text-amber-300">On hold</span>
                      <span className="text-muted-foreground/80">• Wait time {call.waitTime}</span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 text-primary animate-pulse" />
                      <span className="font-semibold text-primary">Speaking with rep</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground/80">
                  Transcript & sentiment scores stream live for QA.
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="rounded-full px-4">
                    View transcript
                  </Button>
                  <Button size="sm" className="rounded-full px-4">
                    Jump in
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-border/60 bg-background/95">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Queued Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {queuedTasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/90 px-4 py-3 transition-surface hover:border-primary/35 hover:bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground/90">{task.merchant}</span>
                    <span className="text-xs text-muted-foreground">{task.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn("rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-wide", priorityTone[task.priority])}>
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground/80">Est. {task.estimatedWait}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-background/95">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Completed Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedToday.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/90 px-4 py-3 transition-surface"
              >
                <div className="flex items-center gap-3">
                  {task.result === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground/90">{task.merchant}</span>
                    <span className="text-xs text-muted-foreground">{task.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="font-medium text-foreground/80">{task.duration}</p>
                    {task.amount > 0 && <p className="text-emerald-400">+${task.amount.toFixed(2)}</p>}
                  </div>
                  <Badge
                    className={cn(
                      "rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-wide",
                      task.result === "success"
                        ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200"
                        : "border-destructive/40 bg-destructive/20 text-destructive"
                    )}
                  >
                    {task.result}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
