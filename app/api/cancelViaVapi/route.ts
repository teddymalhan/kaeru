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
    
    console.log(`🤖 Testing VAPI call directly for ${body.metadata.merchant}`);
    
    // Call VAPI API directly from the API route
    const vapiApiKey = '0d0966bc-3a58-4838-aa2a-5a0789a9d9ce';
    const vapiAssistantId = '8e23c7bf-fd11-4f81-b009-27a7e0567a32';
    const phoneNumber = body.metadata.customPhoneNumber || '+17788551600';
    
    console.log(`📞 Calling VAPI API directly...`);
    console.log(`🔑 API Key: ${vapiApiKey ? 'Present' : 'Missing'}`);
    console.log(`🤖 Assistant ID: ${vapiAssistantId}`);
    console.log(`📱 Phone Number: ${phoneNumber}`);
    
    // Use phoneNumberId from VAPI dashboard with dynamic metadata
    const vapiRequest = {
      assistantId: vapiAssistantId,
      phoneNumberId: "dff6f135-80e2-4d46-bc82-cb4a51bf728b", // Your VAPI phone number ID
      customer: {
        number: phoneNumber
      },
      metadata: {
        merchant: body.metadata.merchant,
        detectionItemId: body.detectionItemId,
        amount: body.metadata.amount,
        accountLast4: body.metadata.accountLast4,
        reason: 'subscription_cancellation',
        callType: 'cancellation',
        // Pass additional context for Riley
        customerName: body.metadata.customerName || "Customer",
        subscriptionType: body.metadata.subscriptionType || "monthly",
        cancellationReason: body.metadata.cancellationReason || "No longer needed"
      }
    };
    
    console.log(`📤 VAPI request:`, JSON.stringify(vapiRequest, null, 2));
    
    const vapiResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vapiRequest)
    });
    
    const vapiResult = await vapiResponse.json();
    
    console.log(`📥 VAPI response status: ${vapiResponse.status}`);
    console.log(`📥 VAPI response body:`, JSON.stringify(vapiResult, null, 2));
    
    if (!vapiResponse.ok) {
      console.error(`❌ VAPI API error: ${vapiResult.message || 'Unknown error'}`);
      return NextResponse.json({
        success: false,
        message: `VAPI call failed: ${vapiResult.message || 'Unknown error'}`,
        error: vapiResult.message || 'Unknown VAPI error',
        statusCode: vapiResponse.status,
        vapiResponse: vapiResult
      });
    }
    
    console.log(`✅ VAPI call initiated successfully: ${vapiResult.id}`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully initiated VAPI call with Riley's assistant for ${body.metadata.merchant}`,
      data: body,
      timestamp: new Date().toISOString(),
      method: 'voice',
      merchant: body.metadata.merchant,
      detectionItemId: body.detectionItemId,
      callId: vapiResult.id,
      callStatus: 'initiated',
      outcome: 'pending',
      phoneNumber: phoneNumber,
      assistantId: vapiAssistantId,
      source: 'direct-vapi-api'
    });
    
  } catch (error) {
    console.error('Error calling VAPI API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to call VAPI API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getMerchantPhoneNumber(merchant: string): string {
  const merchantPhones: Record<string, string> = {
    'Netflix': '+1-866-579-7172',
    'Spotify': '+1-877-778-6087',
    'Amazon Prime': '+1-888-280-4331',
    'Disney+': '+1-888-905-7888',
    'Hulu': '+1-877-485-8412',
    'Adobe': '+1-800-833-6687',
    'Microsoft': '+1-800-642-7676',
    'Apple': '+1-800-275-2273',
    'Google': '+1-650-253-0000'
  };
  
  return merchantPhones[merchant] || '+1-800-000-0000';
}
