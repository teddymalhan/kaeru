"use client"

import { useCallback, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { Phone, XCircle, AlertTriangle } from "lucide-react"
import { postJson, type ApiResult } from "@/app/lib/api-client"

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
      key: "file-dispute",
      label: "File Dispute",
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
      } finally {
        setLoadingAction(null)
      }
    },
    [loadingAction],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
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
                className="h-auto flex-col gap-2 py-4 bg-transparent"
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

        <div className="mt-6 space-y-3">
          {actions.map((action) => {
            const outcome = outcomes[action.key]
            const statusColor = outcome?.status === "success" ? "text-green-600" : "text-red-600"

            return (
              <div key={`${action.key}-outcome`} className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">{action.label}</p>
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
                    <pre className="mt-2 max-h-40 overflow-auto rounded bg-background p-2 text-xs">
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
