import { NextResponse } from "next/server"
import { suspiciousTransactions } from "@/app/lib/sample-data"

export async function GET() {
  return NextResponse.json({ items: suspiciousTransactions })
}

