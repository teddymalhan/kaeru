import { NextRequest, NextResponse } from 'next/server';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "../../../amplify_outputs.json";

// Configure Amplify
Amplify.configure(amplifyOutputs);
const client = generateClient<Schema>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.metadata?.merchant) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userId or metadata.merchant' 
        },
        { status: 400 }
      );
    }
    
    console.log(`🤖 Testing VAPI call directly for ${body.metadata.merchant}`);
    
    let detectionItemId = body.detectionItemId;
    
    // Create DetectionItem if not provided
    if (!detectionItemId) {
      try {
        const { data: newDetectionItem, errors } = await client.models.DetectionItem.create({
          itemName: `${body.metadata.merchant} - VAPI Cancellation`,
          subscriptionType: body.metadata.subscriptionType || "MONTHLY",
          status: "IN_PROGRESS",
          detectedAmount: body.metadata.amount,
          confidence: 0.95,
          notes: `VAPI cancellation call for ${body.metadata.merchant}`,
          transactionId: "vapi-transaction"
        });
        
        if (errors || !newDetectionItem) {
          console.error(`❌ Failed to create DetectionItem:`, errors);
          return NextResponse.json(
            { error: 'Failed to create DetectionItem', details: errors },
            { status: 500 }
          );
        }
        
        detectionItemId = newDetectionItem.id;
        console.log(`✅ Created DetectionItem: ${detectionItemId}`);
      } catch (createError) {
        console.error(`❌ Failed to create DetectionItem:`, createError);
        return NextResponse.json(
          { error: 'Failed to create DetectionItem', details: createError },
          { status: 500 }
        );
      }
    } else {
      // Update existing DetectionItem status to IN_PROGRESS
      try {
        await client.models.DetectionItem.update({
          id: detectionItemId,
          status: "IN_PROGRESS"
        });
        console.log(`📊 Updated DetectionItem ${detectionItemId} status to IN_PROGRESS`);
      } catch (updateError) {
        console.error(`❌ Failed to update DetectionItem status:`, updateError);
        // Continue with VAPI call even if status update fails
      }
    }
    
    // Call VAPI API directly from the API route
    const vapiApiKey = '0d0966bc-3a58-4838-aa2a-5a0789a9d9ce';
    
    // Use different assistant and phone number based on call type
    const callType = body.metadata.callType || 'cancellation';
    const vapiAssistantId = callType === 'dispute' 
      ? '8e23c7bf-fd11-4f81-b009-27a7e0567a32' // Same assistant for now, but can be different
      : '8e23c7bf-fd11-4f81-b009-27a7e0567a32'; // Cancellation assistant
    
    // For outbound calls: customer.number = your demo number (who we're calling)
    // phoneNumberId = your Twilio number (the number making the call)
    const targetPhoneNumber = '+17788551600'; // Your demo number
    
    console.log(`📞 Calling VAPI API directly...`);
    console.log(`🔑 API Key: ${vapiApiKey ? 'Present' : 'Missing'}`);
    console.log(`🤖 Assistant ID: ${vapiAssistantId}`);
    console.log(`📱 Calling demo number: ${targetPhoneNumber}`);
    console.log(`📞 Using Canadian Twilio number: +14506346226`);
    
    // Use phoneNumberId from VAPI dashboard with dynamic metadata
    const vapiRequest = {
      assistantId: vapiAssistantId,
      phoneNumberId: "dff6f135-80e2-4d46-bc82-cb4a51bf728b", 
      customer: {
        number: targetPhoneNumber
      },
      metadata: {
        merchant: body.metadata.merchant,
        detectionItemId: detectionItemId,
        amount: body.metadata.amount,
        accountLast4: body.metadata.accountLast4,
        reason: callType === 'dispute' ? 'transaction_dispute' : 'subscription_cancellation',
        callType: callType,
        // Pass additional context for Riley
        customerName: body.metadata.customerName || "Customer",
        subscriptionType: body.metadata.subscriptionType || "monthly",
        cancellationReason: body.metadata.cancellationReason || "No longer needed",
        disputeReason: body.metadata.disputeReason || "Unauthorized charge",
        date: new Date().toISOString().split('T')[0], // Today's date
        bankName: "Customer Bank" // Default bank name for disputes
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
      
      // Update DetectionItem status to FOLLOW_UP_REQUIRED due to VAPI failure
      try {
        await client.models.DetectionItem.update({
          id: detectionItemId,
          status: "FOLLOW_UP_REQUIRED"
        });
        console.log(`📊 Updated DetectionItem ${detectionItemId} status to FOLLOW_UP_REQUIRED (VAPI failed)`);
      } catch (updateError) {
        console.error(`❌ Failed to update DetectionItem status after VAPI failure:`, updateError);
      }
      
      return NextResponse.json({
        success: false,
        message: `VAPI call failed: ${vapiResult.message || 'Unknown error'}`,
        error: vapiResult.message || 'Unknown VAPI error',
        statusCode: vapiResponse.status,
        vapiResponse: vapiResult,
        detectionItemStatus: "FOLLOW_UP_REQUIRED"
      });
    }
    
    console.log(`✅ VAPI call initiated successfully: ${vapiResult.id}`);
    
    // Simulate VAPI call outcome based on call type and merchant (in real implementation, this would come from VAPI webhook)
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
    
    // Disputes have different success rates
    const baseSuccessRate = merchantSuccessRates[body.metadata.merchant] || merchantSuccessRates['Unknown'];
    const successRate = callType === 'dispute' ? Math.min(baseSuccessRate + 0.1, 0.95) : baseSuccessRate;
    const isSuccessful = Math.random() < successRate;
    
    // Update DetectionItem status based on simulated outcome
    const finalStatus = isSuccessful ? "COMPLETED" : "FOLLOW_UP_REQUIRED";
    try {
      await client.models.DetectionItem.update({
        id: detectionItemId,
        status: finalStatus,
        cancellationDate: isSuccessful ? new Date().toISOString() : undefined
      });
      console.log(`📊 Updated DetectionItem ${detectionItemId} status to ${finalStatus}`);
    } catch (updateError) {
      console.error(`❌ Failed to update DetectionItem final status:`, updateError);
    }
    
    const actionText = callType === 'dispute' ? 'dispute' : 'cancellation';
    const actionPastTense = callType === 'dispute' ? 'disputed' : 'cancelled';
    
    return NextResponse.json({
      success: true,
      message: `Successfully initiated VAPI call with Riley's assistant for ${body.metadata.merchant} ${actionText}`,
      data: body,
      timestamp: new Date().toISOString(),
      method: 'voice',
      merchant: body.metadata.merchant,
      detectionItemId: detectionItemId,
      callId: vapiResult.id,
      callStatus: 'initiated',
      outcome: isSuccessful ? 'completed' : 'follow_up_required',
      phoneNumber: phoneNumber,
      assistantId: vapiAssistantId,
      source: 'direct-vapi-api',
      detectionItemStatus: finalStatus,
      isSuccessful: isSuccessful,
      callType: callType,
      followUpReason: isSuccessful ? null : `Provider declined ${actionText} or requires manual intervention`
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
    'Netflix': '+18665797172',
    'Spotify': '+18777786087',
    'Amazon Prime': '+18882804331',
    'Disney+': '+18889057888',
    'Hulu': '+18774858412',
    'Adobe': '+18008336687',
    'Microsoft': '+18006427676',
    'Apple': '+18002752273',
    'Google': '+16502530000'
  };
  
  return merchantPhones[merchant] || '+18005551234';
}
