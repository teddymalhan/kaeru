import { NextResponse } from "next/server"
import { recentActivity } from "@/app/lib/sample-data"

export async function GET() {
  return NextResponse.json({ items: recentActivity })
}

