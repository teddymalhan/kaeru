import { AgentStatus } from "./components/agent-status"
import { FraudAlerts } from "./components/fraud-alerts"
import { RecentActivity } from "./components/recent-activity"
import { QuickActions } from "./components/quick-actions"
import { TransactionsList } from "./components/transactions-list"
import { SubscriptionsList } from "./components/subscriptions-list"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-balance">Your AI Financial Assistant</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Automate returns, cancellations, disputes, and customer service calls while detecting fraud
            </p>
          </div>

          {/* Agent Status & Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <AgentStatus />
            <QuickActions />
          </div>

          {/* Fraud Alerts */}
          <FraudAlerts />

          {/* Recent Activity */}
          <RecentActivity />

          {/* Transactions & Subscriptions */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TransactionsList />
            <SubscriptionsList />
          </div>
        </div>
      </main>
    </div>
  )
}
