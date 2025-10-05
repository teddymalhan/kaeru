import { NextResponse } from "next/server"
import { transactions } from "@/app/lib/sample-data"

export async function GET() {
  return NextResponse.json({ items: transactions })
}

