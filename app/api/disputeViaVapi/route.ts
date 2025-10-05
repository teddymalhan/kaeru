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
    
    console.log(`🤖 Testing VAPI dispute for ${body.metadata.merchant}`);
    
    // Simulate VAPI call result with Riley's assistant
    const success = Math.random() < 0.70; // 70% success rate for disputes
    
    if (success) {
      const callId = `DISPUTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const caseId = `CASE_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      return NextResponse.json({
        success: true,
        message: `Successfully initiated VAPI dispute call with Riley's assistant for ${body.metadata.merchant}`,
        data: body,
        timestamp: new Date().toISOString(),
        method: 'voice',
        merchant: body.metadata.merchant,
        detectionItemId: body.detectionItemId,
        callId,
        callStatus: 'initiated',
        disputeSubmitted: true,
        caseId,
        disputeStatus: 'completed',
        bankName: 'Chase Bank', // Simulated bank
        phoneNumber: body.metadata.customPhoneNumber || '+1-800-935-9935', // Use custom number or simulated bank dispute line
        assistantId: process.env.VAPI_DISPUTE_ASSISTANT_ID
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `VAPI dispute call failed for ${body.metadata.merchant}. Riley's assistant couldn't reach bank support.`,
        data: body,
        timestamp: new Date().toISOString(),
        method: 'voice',
        merchant: body.metadata.merchant,
        detectionItemId: body.detectionItemId,
        disputeSubmitted: false,
        disputeStatus: 'failed',
        error: 'Call failed - no answer or busy line',
        bankName: 'Chase Bank',
        phoneNumber: '+1-800-935-9935',
        assistantId: process.env.VAPI_DISPUTE_ASSISTANT_ID
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
