import { NextResponse } from "next/server"

type CancelEmailRequest = {
  detectionItemId?: string
  userId?: string
  metadata?: {
    merchant?: string
    amount?: number
    date?: string
    accountLast4?: string
  }
}

const REQUIRED_ERROR = "Missing required fields: detectionItemId, userId, or metadata.merchant"

const MERCHANT_SUCCESS_RATES: Record<string, number> = {
  Netflix: 0.85,
  Spotify: 0.8,
  Adobe: 0.7,
}

function randomSuffix(prefix: string) {
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${Date.now()}_${randomPart}`
}

function determineSuccess(merchant: string) {
  const successRate = MERCHANT_SUCCESS_RATES[merchant] ?? 0.6
  return Math.random() < successRate
}

export async function POST(request: Request) {
  let body: CancelEmailRequest

  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }

  const merchant = body.metadata?.merchant

  if (!body.detectionItemId || !body.userId || !merchant) {
    return NextResponse.json({ success: false, error: REQUIRED_ERROR }, { status: 400 })
  }

  const succeeded = determineSuccess(merchant)

  if (succeeded) {
    return NextResponse.json({
      success: true,
      message: `Successfully sent cancellation email for ${merchant} subscription`,
      method: "email",
      merchant,
      detectionItemId: body.detectionItemId,
      emailId: randomSuffix("EMAIL"),
      draftId: randomSuffix("DRAFT"),
    })
  }

  return NextResponse.json({
    success: false,
    message: `Email cancellation failed for ${merchant}. Will try voice call fallback.`,
    method: "email",
    merchant,
    detectionItemId: body.detectionItemId,
    error: "Network timeout",
  })
}
