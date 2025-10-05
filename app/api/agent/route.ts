import { NextResponse } from "next/server"
import { agentActiveCalls, agentQueuedTasks, agentCompletedToday } from "@/app/lib/sample-data"

export async function GET() {
  const completed = agentCompletedToday
  const successRate = Math.round((completed.filter((t) => t.result === "success").length / completed.length) * 100)
  return NextResponse.json({
    activeCalls: agentActiveCalls,
    queuedTasks: agentQueuedTasks,
    completedToday: agentCompletedToday,
    successRate,
  })
}

