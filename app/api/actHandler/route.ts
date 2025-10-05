import { NextResponse } from "next/server"

type ActAction = "cancel" | "dispute" | "keep"

type ActHandlerRequest = {
  action?: string
  detectionItemId?: string
  userId?: string
}

const WORKFLOW_CONFIG: Record<Exclude<ActAction, "keep">, { workflowType: string }> = {
  cancel: { workflowType: "CancelFlow" },
  dispute: { workflowType: "DisputeFlow" },
}

const REQUIRED_FIELDS: Array<keyof Required<ActHandlerRequest>> = [
  "action",
  "detectionItemId",
  "userId",
]

function buildExecutionArn(workflowType: string) {
  return `arn:aws:states:us-east-1:123456789012:execution:${workflowType}:${Date.now()}`
}

function missingFields(body: ActHandlerRequest) {
  return REQUIRED_FIELDS.filter((field) => !body[field])
}

export async function POST(request: Request) {
  let body: ActHandlerRequest

  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }

  const missing = missingFields(body)

  if (missing.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing required fields: ${REQUIRED_FIELDS.join(", ")}`,
      },
      { status: 400 },
    )
  }

  const action = body.action as ActAction

  if (!["cancel", "dispute", "keep"].includes(action)) {
    return NextResponse.json(
      { success: false, error: `Invalid action: ${body.action}` },
      { status: 400 },
    )
  }

  if (action === "keep") {
    return NextResponse.json({
      success: true,
      message: "Item marked as legitimate",
      status: "COMPLETED",
      action,
      workflowType: "KeepAction",
    })
  }

  const { workflowType } = WORKFLOW_CONFIG[action]

  return NextResponse.json({
    success: true,
    executionArn: buildExecutionArn(workflowType),
    status: "STARTED",
    action,
    workflowType,
    detectionItemId: body.detectionItemId,
  })
}
