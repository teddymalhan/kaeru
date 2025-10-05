import { AgentStatus } from "./components/agent-status"
import { FraudAlerts } from "./components/fraud-alerts"
import { RecentActivity } from "./components/recent-activity"
import { QuickActions } from "./components/quick-actions"
import { TransactionsList } from "./components/transactions-list"
import { SubscriptionsList } from "./components/subscriptions-list"
import { Button } from "./components/ui/button"
import PlaidLink from "./components/PlaidLink"

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background via-background to-primary/5 px-6 py-10 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-surface motion-safe:animate-fade-up sm:px-10">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 right-0 h-40 w-40 translate-y-1/3 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-6 text-pretty">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[0.7rem] font-medium tracking-[0.18em]">
              Preview Build
            </span>
            <span className="hidden text-muted-foreground md:inline">Accelerate every cancellation, dispute, and refund</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Your AI Financial Operations Partner
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Manage cancellations, disputes, and basic customer outreach from one dashboard. Track activity,
              see results, and export data when you need it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">Launch Workflow</Button>
            <Button variant="outline" size="lg">
              View Live Activity
            </Button>
            <span className="text-sm text-muted-foreground/80">
              Setup requires connecting your accounts and providers.
            </span>
          </div>
        </div>
      </section>

      {/* Agent Status & Quick Actions */}
      <section className="grid gap-6 md:grid-cols-2">
        <AgentStatus />
        <QuickActions />
      </section>

      {/* Bank Connection */}
      <section className="motion-safe:animate-fade-up">
        <PlaidLink />
      </section>

      {/* Fraud Alerts */}
      <section className="motion-safe:animate-fade-up">
        <FraudAlerts />
      </section>

      {/* Recent Activity */}
      <section className="motion-safe:animate-fade-up">
        <RecentActivity />
      </section>

      {/* Transactions & Subscriptions */}
      <section className="grid gap-6 lg:grid-cols-2">
        <TransactionsList />
        <SubscriptionsList />
      </section>
    </div>
  )
}
