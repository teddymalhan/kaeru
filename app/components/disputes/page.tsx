import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { CheckCircle2, Clock, FileText, Phone, Plus, ShieldAlert, XOctagon } from "lucide-react"
import { cn } from "@/lib/utils"

type AgentIcon = typeof Phone

const disputes = [
  {
    id: "1",
    merchant: "Unknown Merchant LLC",
    amount: 499,
    date: "2025-10-01",
    status: "in_progress",
    type: "Fraud",
    description: "Unrecognized charge on credit card",
    agentStatus: "calling",
    lastUpdate: "Agent on hold with merchant — 15 minute wait time",
  },
  {
    id: "2",
    merchant: "Suspicious Store XYZ",
    amount: 1200,
    date: "2025-09-28",
    status: "pending",
    type: "Fraud",
    description: "Large transaction outside customer region",
    agentStatus: "queued",
    lastUpdate: "Awaiting merchant connection window",
  },
  {
    id: "3",
    merchant: "FitnessPro Gym",
    amount: 299,
    date: "2025-09-20",
    status: "resolved",
    type: "Cancellation",
    description: "Charged after membership cancellation",
    agentStatus: "completed",
    lastUpdate: "Refund processed — $299.00 credited",
  },
  {
    id: "4",
    merchant: "TechGadgets Inc",
    amount: 89.99,
    date: "2025-09-15",
    status: "in_progress",
    type: "Return",
    description: "Return label generated but refund pending",
    agentStatus: "calling",
    lastUpdate: "Escalated to level two supervisor",
  },
  {
    id: "5",
    merchant: "StreamMax",
    amount: 24.99,
    date: "2025-09-10",
    status: "rejected",
    type: "Billing Error",
    description: "Double charged for subscription",
    agentStatus: "completed",
    lastUpdate: "Merchant declined claim — schedule follow-up",
  },
]

const stats = {
  total: disputes.length,
  inProgress: disputes.filter((dispute) => dispute.status === "in_progress").length,
  resolved: disputes.filter((dispute) => dispute.status === "resolved").length,
  pending: disputes.filter((dispute) => dispute.status === "pending").length,
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
                <span>Dispute Command Center</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Resolve conflict with couture-grade UX</h1>
              <p className="max-w-2xl text-base text-muted-foreground">
                Every escalation is orchestrated with timestamps, transcripts, and recovery guidance so teams can close the
                loop elegantly.
              </p>
            </div>
            <Button size="lg" className="rounded-full px-6">
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

      <Card className="rounded-3xl border-border/60 bg-background/95">
        <CardHeader className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold">Dispute Journal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Each dispute is tracked through curated service playbooks, notes, and call outcomes.
            </p>
          </div>
          <Button variant="outline" className="rounded-full px-5">
            <FileText className="mr-2 h-4 w-4" />
            Export dossier
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {disputes.map((dispute) => {
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
                      <Badge
                        className={cn(
                          "rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-wide",
                          statusStyles[dispute.status] ?? "border-primary/30 bg-primary/10 text-primary"
                        )}
                      >
                        {dispute.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-primary/25 text-xs uppercase tracking-wide text-primary">
                        {dispute.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{dispute.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/80">
                      <span>{formatCurrency.format(dispute.amount)}</span>
                      <span className="text-muted-foreground/40">•</span>
                      <span>{formatDate.format(new Date(dispute.date))}</span>
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
