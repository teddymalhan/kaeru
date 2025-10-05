import { NextResponse } from "next/server"
import { subscriptions } from "@/app/lib/sample-data"

export async function GET() {
  return NextResponse.json({ items: subscriptions })
}

