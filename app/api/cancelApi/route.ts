import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.detectionItemId || !body.userId || !body.metadata?.merchant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: detectionItemId, userId, or metadata.merchant' 
        },
        { status: 400 }
      );
    }
    
    // Simulate different success rates based on merchant
    const merchantSuccessRates: Record<string, number> = {
      'Netflix': 0.9,
      'Spotify': 0.85,
      'Amazon Prime': 0.7,
      'Disney+': 0.8,
      'Hulu': 0.75,
      'Adobe': 0.6,
      'Microsoft': 0.65,
      'Apple': 0.8,
      'Google': 0.85,
      'Unknown': 0.3
    };
    
    const successRate = merchantSuccessRates[body.metadata.merchant] || merchantSuccessRates['Unknown'];
    const success = Math.random() < successRate;
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: `Successfully cancelled ${body.metadata.merchant} subscription via API`,
        data: body,
        timestamp: new Date().toISOString(),
        method: 'api',
        merchant: body.metadata.merchant,
        detectionItemId: body.detectionItemId,
        cancellationId: `API_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `API cancellation failed for ${body.metadata.merchant}. Will try email fallback.`,
        data: body,
        timestamp: new Date().toISOString(),
        method: 'api',
        merchant: body.metadata.merchant,
        detectionItemId: body.detectionItemId,
        error: 'Merchant API returned failure response'
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
