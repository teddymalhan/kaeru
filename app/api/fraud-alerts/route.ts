import { NextResponse } from "next/server"
import { fraudAlerts } from "@/app/lib/sample-data"

export async function GET() {
  return NextResponse.json({ items: fraudAlerts })
}

