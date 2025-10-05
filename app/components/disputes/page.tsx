"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { CheckCircle2, Clock, FileText, Phone, Plus, Search, ShieldAlert, XOctagon } from "lucide-react"
import { cn } from "@/lib/utils"
import { postJson, type ApiResult } from "@/app/lib/api-client"
import { addActivity } from "@/app/lib/activity"
import { getFiledMap, isDisputeFiled, markDisputeFiled } from "@/app/lib/disputes-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"

type AgentIcon = typeof Phone

type Dispute = {
  id: string
  merchant: string
  amount: number
  date: string
  status: string
  type: string
  description: string
  agentStatus: string
  lastUpdate: string
}

const statusStyles: Record<string, string> = {
  in_progress: "border-amber-400/30 bg-amber-400/15 text-amber-200",
  pending: "border-primary/25 bg-primary/10 text-primary",
  resolved: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200",
  rejected: "border-destructive/40 bg-destructive/20 text-destructive",
}

const agentStatusCopy: Record<string, { icon: AgentIcon; tone: string; label: string; note: string }> = {
  calling: {
    icon: Phone,
    tone: "text-primary",
    label: "Agent connected",
    note: "Live call in progress",
  },
  queued: {
    icon: Clock,
    tone: "text-amber-400",
    label: "Queued",
    note: "Standby for merchant",
  },
  completed: {
    icon: CheckCircle2,
    tone: "text-emerald-400",
    label: "Completed",
    note: "Outcome logged",
  },
}

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const formatDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export default function DisputesPage() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [items, setItems] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [recentFiled, setRecentFiled] = useState<Array<{ id: string; data: any; timestamp: number }>>([])
  const [txnItems, setTxnItems] = useState<any[]>([])
  const [createOutcome, setCreateOutcome] = useState<
    | { status: "success" | "error"; httpStatus: number; timestamp: number; payload: unknown | null; error: unknown | null }
    | null
  >(null)

  const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch("/api/disputes", { cache: "no-store" })
        const json = await res.json()
        if (!mounted) return
        setItems(Array.isArray(json.items) ? json.items : [])
      } catch {
        if (!mounted) return
        setItems([])
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    })()
    // seed "recently filed" from shared registry and subscribe for live updates
    const seed = () => {
      const map = getFiledMap()
      const rows = Object.values(map)
        .map((r) => ({ id: r.id, data: r.data ?? null, timestamp: r.timestamp }))
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10)
      setRecentFiled(rows)
    }
    seed()
    const onDisputes = () => seed()
    window.addEventListener("cms:disputes", onDisputes)
    return () => {
      mounted = false
      window.removeEventListener("cms:disputes", onDisputes)
    }
  }, [])

  // Fetch transactions for selector when dialog opens
  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const res = await fetch("/api/transactions", { cache: "no-store" })
        const json = await res.json()
        setTxnItems(Array.isArray(json.items) ? json.items : [])
      } catch {
        setTxnItems([])
      }
    })()
  }, [open])

  const stats = useMemo(
    () => ({
      total: recentFiled.length,
      inProgress: recentFiled.length, // treat newly filed as in progress
      resolved: 0,
      pending: 0,
    }),
    [recentFiled],
  )

  const handleNewDispute = useCallback(async () => {
    if (creating) return
    if (!selectedId) return
    setCreating(true)
    setCreateOutcome(null)
    try {
      const result = await postJson({
        endpoint: "/api/actHandler",
        body: {
          action: "dispute",
          detectionItemId: selectedId,
          userId: "user456",
          metadata: (txnItems.find((t: any) => t.id === selectedId) ?? null) as unknown,
        },
      })
      setCreateOutcome({
        status: result.ok ? "success" : "error",
        httpStatus: result.status,
        timestamp: Date.now(),
        payload: result.data,
        error: result.ok ? null : result.error,
      })
      if (result.ok) setOpen(false)
      if (result.ok) {
        const t = txnItems.find((x: any) => x.id === selectedId)
        if (selectedId) markDisputeFiled(selectedId, t)
        addActivity({
          type: "dispute",
          title: "Dispute created",
          description: t
            ? `Opened dispute for ${t.merchant} (${t.id})`
            : `Opened dispute for transaction ${selectedId}`,
          status: "completed",
          data: t ?? { id: selectedId },
        })
        // Redirect to the universal ledger after creating a dispute
        router.push("/components/transactions")
      }
    } catch (error) {
      setCreateOutcome({ status: "error", httpStatus: 0, timestamp: Date.now(), payload: null, error })
      addActivity({
        type: "dispute",
        title: "Dispute failed",
        description: selectedId ? `Could not create dispute for ${selectedId}` : "No transaction selected",
        status: "error",
      })
    } finally {
      setCreating(false)
    }
  }, [creating, selectedId])
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-destructive/10 px-6 py-10 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-surface motion-safe:animate-fade-up sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 18% 25%, color-mix(in srgb, var(--destructive) 18%, transparent) 0%, transparent 55%), radial-gradient(circle at 82% 10%, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-destructive">
                <ShieldAlert className="h-4 w-4" />
                <span>Disputes</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Manage disputes in one place</h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                File new disputes and review items you filed from the dashboard. Status updates appear as they change.
              </p>
            </div>
            <Button size="lg" className="rounded-full px-6" onClick={() => router.push("/components/transactions") }>
              <Plus className="mr-2 h-4 w-4" />
              New Dispute
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Active Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{stats.total}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Total open and historic disputes</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-primary">{stats.inProgress}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Agents actively collaborating</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Resolved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-emerald-400">{stats.resolved}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Funds recovered this week</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border/50 bg-background/85">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Pending Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight text-amber-300">{stats.pending}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">Awaiting merchant collaboration</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recently Filed list removed to avoid duplication; shown in Journal below */}

      {createOutcome && (
        <Card className="rounded-2xl border-border/60 bg-background/95">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">New Dispute Status</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {createOutcome.status === "success" ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-emerald-200">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Dispute created</span>
                <span className="opacity-80">HTTP {createOutcome.httpStatus}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl border border-destructive/40 bg-destructive/20 px-4 py-3 text-destructive">
                <span className="flex items-center gap-2"><XOctagon className="h-4 w-4" /> Failed to create dispute</span>
                <span className="opacity-80">HTTP {createOutcome.httpStatus}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border-border/60 bg-background/95">
        <CardHeader className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold">Dispute Journal</CardTitle>
            <p className="text-sm text-muted-foreground">Filed disputes appear below.</p>
          </div>
          <Button variant="outline" className="rounded-full px-5">
            <FileText className="mr-2 h-4 w-4" />
            Export dossier
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentFiled.length === 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/90 px-5 py-6 text-sm text-muted-foreground">
              No disputes filed yet.
            </div>
          )}
          {recentFiled
            .map((r) => ({
              id: r.id,
              merchant: r.data?.merchant ?? "Transaction",
              amount: typeof r.data?.amount === "number" ? r.data.amount : 0,
              date: r.data?.date ?? new Date(r.timestamp).toISOString(),
              status: "filed" as const,
              type: "Dispute",
              description: r.data?.reason ? String(r.data.reason) : "Dispute created via app",
              agentStatus: "completed",
              lastUpdate: new Date(r.timestamp).toLocaleString(),
              _filed: true,
            }))
            .map((dispute: any) => {
            const agentState = agentStatusCopy[dispute.agentStatus] ?? agentStatusCopy.completed
            const StatusIcon = agentState.icon

            return (
              <div
                key={dispute.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/90 px-5 py-4 transition-surface hover:border-primary/35 hover:bg-card"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-foreground/90">{dispute.merchant}</h3>
                      {dispute._filed ? (
                        <Badge className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-[0.65rem] uppercase tracking-wide text-emerald-200">
                          Filed
                        </Badge>
                      ) : (
                        <Badge
                          className={cn(
                            "rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-wide",
                            statusStyles[dispute.status] ?? "border-primary/30 bg-primary/10 text-primary"
                          )}
                        >
                          {String(dispute.status).replace("_", " ")}
                        </Badge>
                      )}
                      <Badge variant="outline" className="rounded-full border-primary/25 text-xs uppercase tracking-wide text-primary">
                        {dispute.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{dispute.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/80">
                      <span>{formatCurrency.format(dispute.amount)}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span>
                        {(() => {
                          try {
                            const t = new Date(dispute.date as any)
                            return isNaN(t.getTime()) ? String(dispute.date ?? "—") : formatDate.format(t)
                          } catch {
                            return String(dispute.date ?? "—")
                          }
                        })()}
                      </span>
                      <span className="text-muted-foreground/40">•</span>
                      <span>Case #{dispute.id.padStart(4, "0")}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tracking-tight text-foreground">
                      {formatCurrency.format(dispute.amount)}
                    </p>
                    <span className="text-xs text-muted-foreground/70">Financial impact</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-border/60 pt-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <StatusIcon className={cn("h-4 w-4", agentState.tone)} />
                    <span className={cn("font-semibold", agentState.tone)}>{agentState.label}</span>
                    <span className="text-muted-foreground/80">• {agentState.note}</span>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:gap-4">
                    <span>{dispute.lastUpdate}</span>
                    {dispute.status === "rejected" && (
                      <span className="flex items-center gap-2 text-destructive">
                        <XOctagon className="h-4 w-4" /> Escalation recommended
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="rounded-full px-4">
                      View Timeline
                    </Button>
                    <Button size="sm" className="rounded-full px-4">
                      Open Workspace
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
