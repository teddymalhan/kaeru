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

