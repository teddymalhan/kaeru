export type Transaction = {
  id: string
  merchant: string
  amount: number
  date: string // ISO date
  status: "completed" | "flagged"
  category: string
  fraudScore: number
}

export const transactions: Transaction[] = [
  {
    id: "1",
    merchant: "Amazon",
    amount: 156.99,
    date: "2025-10-03",
    status: "completed",
    category: "Shopping",
    fraudScore: 5,
  },
  {
    id: "2",
    merchant: "Netflix",
    amount: 15.99,
    date: "2025-10-02",
    status: "completed",
    category: "Entertainment",
    fraudScore: 2,
  },
  {
    id: "3",
    merchant: "Unknown Merchant LLC",
    amount: 499,
    date: "2025-10-01",
    status: "flagged",
    category: "Unknown",
    fraudScore: 92,
  },
  {
    id: "4",
    merchant: "Whole Foods",
    amount: 87.43,
    date: "2025-09-30",
    status: "completed",
    category: "Groceries",
    fraudScore: 3,
  },
  {
    id: "5",
    merchant: "Shell Gas Station",
    amount: 65,
    date: "2025-09-29",
    status: "completed",
    category: "Gas",
    fraudScore: 8,
  },
  {
    id: "6",
    merchant: "Suspicious Store XYZ",
    amount: 1200,
    date: "2025-09-28",
    status: "flagged",
    category: "Unknown",
    fraudScore: 88,
  },
  {
    id: "7",
    merchant: "Apple Store",
    amount: 299,
    date: "2025-09-27",
    status: "completed",
    category: "Electronics",
    fraudScore: 4,
  },
  {
    id: "8",
    merchant: "Starbucks",
    amount: 12.5,
    date: "2025-09-26",
    status: "completed",
    category: "Food & Drink",
    fraudScore: 1,
  },
  {
    id: "9",
    merchant: "Target",
    amount: 143.22,
    date: "2025-09-25",
    status: "completed",
    category: "Shopping",
    fraudScore: 6,
  },
  {
    id: "10",
    merchant: "Uber",
    amount: 28.75,
    date: "2025-09-24",
    status: "completed",
    category: "Transportation",
    fraudScore: 3,
  },
]

export type Subscription = {
  id: string
  name: string
  amount: number
  billing: "monthly" | "annual" | string
  nextBilling: string
  status: "active" | "paused" | "cancelling"
  category: string
}

export const subscriptions: Subscription[] = [
  { id: "1", name: "Netflix Premium", amount: 15.99, billing: "monthly", nextBilling: "2025-10-15", status: "active", category: "Entertainment" },
  { id: "2", name: "Spotify Family", amount: 16.99, billing: "monthly", nextBilling: "2025-10-20", status: "active", category: "Music" },
  { id: "3", name: "Adobe Creative Cloud", amount: 54.99, billing: "monthly", nextBilling: "2025-10-10", status: "active", category: "Software" },
  { id: "4", name: "Amazon Prime", amount: 14.99, billing: "monthly", nextBilling: "2025-10-25", status: "active", category: "Shopping" },
  { id: "5", name: "ChatGPT Plus", amount: 20, billing: "monthly", nextBilling: "2025-10-18", status: "active", category: "AI Tools" },
  { id: "6", name: "Gym Membership", amount: 49.99, billing: "monthly", nextBilling: "2025-10-05", status: "paused", category: "Fitness" },
  { id: "7", name: "New York Times", amount: 17, billing: "monthly", nextBilling: "2025-10-12", status: "active", category: "News" },
  { id: "8", name: "Dropbox Plus", amount: 11.99, billing: "monthly", nextBilling: "2025-10-22", status: "active", category: "Storage" },
]

export type Dispute = {
  id: string
  merchant: string
  amount: number
  date: string
  status: "in_progress" | "pending" | "resolved" | "rejected"
  type: string
  description: string
  agentStatus: "calling" | "queued" | "completed"
  lastUpdate: string
}

export const disputes: Dispute[] = [
  { id: "1", merchant: "Unknown Merchant LLC", amount: 499, date: "2025-10-01", status: "in_progress", type: "Fraud", description: "Unrecognized charge on credit card", agentStatus: "calling", lastUpdate: "Agent on hold with merchant — 15 minute wait time" },
  { id: "2", merchant: "Suspicious Store XYZ", amount: 1200, date: "2025-09-28", status: "pending", type: "Fraud", description: "Large transaction outside customer region", agentStatus: "queued", lastUpdate: "Awaiting merchant connection window" },
  { id: "3", merchant: "FitnessPro Gym", amount: 299, date: "2025-09-20", status: "resolved", type: "Cancellation", description: "Charged after membership cancellation", agentStatus: "completed", lastUpdate: "Refund processed — $299.00 credited" },
  { id: "4", merchant: "TechGadgets Inc", amount: 89.99, date: "2025-09-15", status: "in_progress", type: "Return", description: "Return label generated but refund pending", agentStatus: "calling", lastUpdate: "Escalated to level two supervisor" },
  { id: "5", merchant: "StreamMax", amount: 24.99, date: "2025-09-10", status: "rejected", type: "Billing Error", description: "Double charged for subscription", agentStatus: "completed", lastUpdate: "Merchant declined claim — schedule follow-up" },
]

export type FraudAlert = {
  id: number
  merchant: string
  amount: string
  date: string
  confidence: "High" | "Medium" | "Low"
  reason: string
}

export const fraudAlerts: FraudAlert[] = [
  { id: 1, merchant: "Unknown Merchant - TX", amount: "$847.32", date: "Today, 2:34 PM", confidence: "High", reason: "Unusual location and amount" },
  { id: 2, merchant: "Premium Subscription Service", amount: "$299.99", date: "Today, 11:22 AM", confidence: "Medium", reason: "Duplicate charge detected" },
]

export type ActivityItem = {
  id: number
  type: string
  title: string
  description: string
  status: "in-progress" | "completed" | "pending"
  time: string
}

export const recentActivity: ActivityItem[] = [
  { id: 1, type: "call", title: "Called Comcast Customer Service", description: "Disputing $45.99 charge", status: "in-progress", time: "5 min ago" },
  { id: 2, type: "success", title: "Netflix Subscription Cancelled", description: "Saved $15.99/month", status: "completed", time: "1 hour ago" },
  { id: 3, type: "success", title: "Amazon Return Initiated", description: "Order #123-4567890-1234567", status: "completed", time: "2 hours ago" },
  { id: 4, type: "pending", title: "Gym Membership Cancellation", description: "Waiting on hold - Position 3 in queue", status: "pending", time: "3 hours ago" },
]

export type SuspiciousTxn = {
  id: number
  amount: string
  merchant: string
  date: string
  riskLevel: "high" | "medium" | "low"
  reason: string
}

export const suspiciousTransactions: SuspiciousTxn[] = [
  { id: 1, amount: "$1,299.99", merchant: "Electronics Depot Online", date: "Oct 4, 2025", riskLevel: "high", reason: "Unusual spending pattern" },
  { id: 2, amount: "$89.99", merchant: "Gaming Store", date: "Oct 3, 2025", riskLevel: "medium", reason: "New merchant" },
  { id: 3, amount: "$45.50", merchant: "Coffee Express", date: "Oct 2, 2025", riskLevel: "low", reason: "Location anomaly" },
]

export type AgentCall = {
  id: string
  merchant: string
  type: string
  status: "on_hold" | "speaking"
  duration: string
  waitTime: string
  priority: "high" | "medium" | "low"
}

export type AgentTask = {
  id: string
  merchant: string
  type: string
  priority: "high" | "medium" | "low"
  estimatedWait: string
}

export type AgentCompleted = {
  id: string
  merchant: string
  type: string
  result: "success" | "failed"
  duration: string
  amount: number
}

export const agentActiveCalls: AgentCall[] = [
  { id: "1", merchant: "Unknown Merchant LLC", type: "Fraud Dispute", status: "on_hold", duration: "15:32", waitTime: "12 min", priority: "high" },
  { id: "2", merchant: "TechGadgets Inc", type: "Return Processing", status: "speaking", duration: "08:45", waitTime: "0 min", priority: "medium" },
]

export const agentQueuedTasks: AgentTask[] = [
  { id: "3", merchant: "Suspicious Store XYZ", type: "Fraud Dispute", priority: "high", estimatedWait: "5 min" },
  { id: "4", merchant: "StreamMax", type: "Subscription Cancel", priority: "medium", estimatedWait: "15 min" },
  { id: "5", merchant: "FitnessPro", type: "Billing Dispute", priority: "low", estimatedWait: "25 min" },
]

export const agentCompletedToday: AgentCompleted[] = [
  { id: "6", merchant: "FitnessPro Gym", type: "Cancellation", result: "success", duration: "12:30", amount: 299 },
  { id: "7", merchant: "Cable Company", type: "Password Reset", result: "success", duration: "18:45", amount: 0 },
  { id: "8", merchant: "Insurance Co", type: "Claim Dispute", result: "failed", duration: "25:12", amount: 450 },
  { id: "9", merchant: "Phone Provider", type: "Bill Dispute", result: "success", duration: "15:20", amount: 85 },
]
