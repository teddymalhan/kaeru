import { NextResponse } from "next/server"

type CancelApiRequest = {
  detectionItemId?: string
  userId?: string
  metadata?: {
    merchant?: string
    amount?: number
    date?: string
    accountLast4?: string
  }
}

type MerchantConfig = {
  successRate: number
}

const MERCHANT_CONFIG: Record<string, MerchantConfig> = {
  Netflix: { successRate: 0.9 },
  Spotify: { successRate: 0.85 },
  Adobe: { successRate: 0.6 },
}

const REQUIRED_ERROR = "Missing required fields: detectionItemId, userId, or metadata.merchant"

function randomSuffix(prefix: string) {
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now()}_${randomPart}`
}

function determineSuccess(merchant: string) {
  const config = MERCHANT_CONFIG[merchant] ?? { successRate: 0.3 }
  return Math.random() < config.successRate
}

export async function POST(request: Request) {
  let body: CancelApiRequest

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
      message: `Successfully cancelled ${merchant} subscription via API`,
      method: "api",
      merchant,
      detectionItemId: body.detectionItemId,
      cancellationId: randomSuffix("API"),
    })
  }

  return NextResponse.json({
    success: false,
    message: `API cancellation failed for ${merchant}. Will try email fallback.`,
    method: "api",
    merchant,
    detectionItemId: body.detectionItemId,
    error: "Merchant API returned failure response",
  })
}
