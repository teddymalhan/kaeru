import { NextResponse } from "next/server"
import { disputes } from "@/app/lib/sample-data"

export async function GET() {
  return NextResponse.json({ items: disputes })
}

