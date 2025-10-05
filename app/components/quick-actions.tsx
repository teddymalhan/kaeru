"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { Phone, XCircle, AlertTriangle, Search } from "lucide-react"
import { postJson, type ApiResult } from "@/app/lib/api-client"
import { cn } from "@/lib/utils"
import { addActivity } from "@/app/lib/activity"
import { isDisputeFiled, markDisputeFiled } from "@/app/lib/disputes-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"

type QuickAction = {
  key: string
  label: string
  icon: LucideIcon
  perform: () => Promise<ApiResult<unknown>>
}

type ActionOutcome = {
  status: "success" | "error"
  httpStatus: number
  timestamp: number
  payload: unknown | null
  error: unknown | null
}

const randomId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`

export function QuickActions() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [outcomes, setOutcomes] = useState<Record<string, ActionOutcome | undefined>>({})
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [disputeQuery, setDisputeQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [creatingDispute, setCreatingDispute] = useState(false)
  const [txnItems, setTxnItems] = useState<any[]>([])

  // Load transactions for the selector
  useEffect(() => {
    if (!disputeOpen) return
    ;(async () => {
      try {
        const res = await fetch("/api/transactions", { cache: "no-store" })
        const json = await res.json()
        setTxnItems(Array.isArray(json.items) ? json.items : [])
      } catch {
        setTxnItems([])
      }
    })()
  }, [disputeOpen])

  const actions: QuickAction[] = [
    {
      key: "make-call",
      label: "Make Call",
      icon: Phone,
      perform: () =>
        postJson({
          endpoint: "/api/actHandler",
          body: {
            action: "cancel",
            detectionItemId: randomId("act"),
            userId: "user456",
          },
        }),
    },
    {
      key: "cancel-service",
      label: "Cancel Service",
      icon: XCircle,
      perform: () =>
        postJson({
          endpoint: "/api/cancelApi",
          body: {
            detectionItemId: randomId("api"),
            userId: "user456",
            metadata: {
              merchant: "Netflix",
              amount: 15.99,
              date: new Date().toISOString().slice(0, 10),
              accountLast4: "1234",
            },
          },
        }),
    },
    {
      key: "new-dispute",
      label: "New Dispute",
      icon: AlertTriangle,
      perform: () =>
        postJson({
          endpoint: "/api/actHandler",
          body: {
            action: "dispute",
            detectionItemId: randomId("dispute"),
            userId: "user456",
          },
        }),
    },
  ]

  const handleAction = useCallback(
    async (action: QuickAction) => {
      if (loadingAction) {
        return
      }

      // For "New Dispute", open selector modal instead of calling immediately
      if (action.key === "new-dispute") {
        setDisputeOpen(true)
        return
      }

      setLoadingAction(action.key)

      try {
        const result = await action.perform()

        setOutcomes((prev) => ({
          ...prev,
          [action.key]: {
            status: result.ok ? "success" : "error",
            httpStatus: result.status,
            timestamp: Date.now(),
            payload: result.data,
            error: result.ok ? null : result.error,
          },
        }))

        // Log to recent activity for successful operations
        if (result.ok) {
          if (action.key === "make-call") {
            addActivity({
              type: "call",
              title: "Initiated cancellation call",
              description: "Agent placed an outbound call",
              status: "in-progress",
            })
          } else if (action.key === "cancel-service") {
            addActivity({
              type: "cancel",
              title: "Service cancellation requested",
              description: "Submitted cancellation to provider",
              status: "completed",
            })
          }
        }
      } catch (error) {
        console.error(`[QuickActions] Action ${action.key} threw`, error)
        setOutcomes((prev) => ({
          ...prev,
          [action.key]: {
            status: "error",
            httpStatus: 0,
            timestamp: Date.now(),
            payload: null,
            error,
          },
        }))
        addActivity({
          type: action.key,
          title: "Action failed",
          description: `The ${action.label} action encountered an error`,
          status: "error",
        })
      } finally {
        setLoadingAction(null)
      }
    },
    [loadingAction],
  )

  const performNewDispute = useCallback(async () => {
    if (creatingDispute || !selectedId) return
    setCreatingDispute(true)
    try {
      const result = await postJson({
        endpoint: "/api/actHandler",
        body: {
          action: "dispute",
          detectionItemId: selectedId,
          userId: "user456",
          metadata: (txnItems.find((t) => t.id === selectedId) ?? null) as unknown,
        },
      })
      setOutcomes((prev) => ({
        ...prev,
        ["new-dispute"]: {
          status: result.ok ? "success" : "error",
          httpStatus: result.status,
          timestamp: Date.now(),
          payload: result.data,
          error: result.ok ? null : result.error,
        },
      }))
      if (result.ok) {
        setDisputeOpen(false)
        setDisputeQuery("")
        setSelectedId(null)
        const selected = txnItems.find((t) => t.id === selectedId)
        if (selectedId) markDisputeFiled(selectedId, selected)
        addActivity({
          type: "dispute",
          title: "Dispute created",
          description: selected
            ? `Opened dispute for ${selected.merchant} (${selected.id})`
            : `Opened dispute for transaction ${selectedId}`,
          status: "completed",
          data: selected ?? { id: selectedId },
        })
      }
    } catch (error) {
      setOutcomes((prev) => ({
        ...prev,
        ["new-dispute"]: {
          status: "error",
          httpStatus: 0,
          timestamp: Date.now(),
          payload: null,
          error,
        },
      }))
      addActivity({
        type: "dispute",
        title: "Dispute failed",
        description: selectedId ? `Could not create dispute for ${selectedId}` : "No transaction selected",
        status: "error",
      })
    } finally {
      setCreatingDispute(false)
    }
  }, [creatingDispute, selectedId])

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Launch concierge workflows without leaving the dashboard.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            const isLoading = loadingAction === action.key

            return (
              <Button
                key={action.key}
                variant="outline"
                className={cn(
                  "h-auto flex-col gap-2 rounded-2xl border-border/60 bg-background/80 py-4 text-sm font-medium",
                  isLoading && "pointer-events-none opacity-80"
                )}
                onClick={() => void handleAction(action)}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{isLoading ? "Working..." : action.label}</span>
              </Button>
            )
          })}
        </div>

        {/* New Dispute Selector */}
        <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Select a transaction to dispute</DialogTitle>
              <DialogDescription>Search and choose a specific transaction to file a dispute.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                <input
                  value={disputeQuery}
                  onChange={(e) => setDisputeQuery(e.target.value)}
                  placeholder="Search by merchant, amount, category, or ID"
                  className="h-10 w-full rounded-full border border-border/60 bg-background/70 pl-10 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="max-h-80 overflow-auto rounded-xl border border-border/60">
                <div className="divide-y divide-border/60">
                  {txnItems
                    .filter((t) => {
                      const q = disputeQuery.trim().toLowerCase()
                      if (!q) return true
                      return (
                        t.merchant.toLowerCase().includes(q) ||
                        t.category.toLowerCase().includes(q) ||
                        t.id.toLowerCase().includes(q) ||
                        String(t.amount).includes(q)
                      )
                    })
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((t) => {
                      const isSelected = selectedId === t.id
                      const alreadyFiled = isDisputeFiled(t.id)
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => !alreadyFiled && setSelectedId(t.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-surface",
                            alreadyFiled
                              ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                              : isSelected
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-primary/5 text-foreground",
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold">{t.merchant}</span>
                              {alreadyFiled && (
                                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-300">
                                  Filed
                                </span>
                              )}
                              {t.status === "flagged" && (
                                <span className="rounded-full border border-destructive/40 bg-destructive/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                                  Flagged
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground/80">
                              {t.category} • {new Date(t.date).toLocaleDateString()} • ID {t.id}
                            </div>
                          </div>
                          <div className="text-right text-sm font-semibold">${'{'}t.amount.toFixed(2){'}'}</div>
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-3">
              <Button onClick={performNewDispute} disabled={!selectedId || creatingDispute} className="rounded-full px-5">
                {creatingDispute ? "Creating…" : "Create Dispute"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-6 space-y-3">
          {actions.map((action) => {
            const outcome = outcomes[action.key]
            const statusColor = outcome?.status === "success" ? "text-emerald-500 dark:text-emerald-300" : "text-destructive"

            return (
              <div
                key={`${action.key}-outcome`}
                className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-foreground/90">{action.label}</p>
                  {outcome ? (
                    <span className={`${statusColor} font-semibold`}>
                      {outcome.status.toUpperCase()} • HTTP {outcome.httpStatus}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">No request yet</span>
                  )}
                </div>
                {outcome && (
                  <>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(outcome.timestamp).toLocaleTimeString()} • {outcome.error ? "Error payload" : "Response payload"}
                    </p>
                    <pre className="mt-2 max-h-40 overflow-auto rounded-2xl border border-border/50 bg-card/80 p-3 text-xs text-muted-foreground">
                      {JSON.stringify(outcome.error ?? outcome.payload, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
