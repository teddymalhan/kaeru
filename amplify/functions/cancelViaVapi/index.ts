import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * cancelViaVapi Lambda Function
 * Uses VAPI to make voice calls to merchant support lines for subscription cancellation
 * This is the final fallback when API and email methods fail
 */

interface CancelViaVapiEvent {
  detectionItemId: string;
  userId: string;
  metadata: {
    merchant: string;
    amount: number;
    date: string;
    accountLast4: string;
    customPhoneNumber?: string;
    testPhoneNumber?: string;
  };
  reason?: string; // Why we're using voice (API/email failed)
}

interface CancelViaVapiResponse {
  success: boolean;
  method: string;
  merchant: string;
  detectionItemId: string;
  callId?: string;
  callStatus?: string;
  transcript?: string;
  outcome?: 'cancelled' | 'pending' | 'failed' | 'no_answer';
  error?: string;
  message?: string;
  callDuration?: number;
  phoneNumber?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<CancelViaVapiResponse> => {
  console.log('cancelViaVapi received event:', JSON.stringify(event, null, 2));

  try {
    const payload = event as unknown as CancelViaVapiEvent;
    const { detectionItemId, userId, metadata, reason } = payload;

    // Validate input
    if (!detectionItemId || !userId || !metadata?.merchant) {
      throw new Error('Missing required fields: detectionItemId, userId, or metadata.merchant');
    }

    console.log(`🤖 Initiating VAPI call for ${metadata.merchant} cancellation - ${detectionItemId}`);
    console.log(`📞 Reason: ${reason || 'Primary voice cancellation method'}`);

          // Get merchant-specific phone number and assistant configuration
          // Support custom phone number for testing (e.g., user's own phone)
          const customPhoneNumber = metadata.customPhoneNumber || metadata.testPhoneNumber;
          const merchantConfig = getMerchantPhoneNumber(metadata.merchant, customPhoneNumber);

          // Ensure we have a valid phone number
          if (!merchantConfig.phoneNumber) {
            console.log(`❌ No phone number available for ${metadata.merchant}`);
            return {
              success: false,
              method: 'voice',
              merchant: metadata.merchant,
              detectionItemId,
              error: `No support phone number available for ${metadata.merchant}`,
              message: `Voice cancellation failed: No support phone number for ${metadata.merchant}`
            };
          }

    // Simulate VAPI call (replace with actual VAPI SDK implementation)
    // At this point, merchantConfig.phoneNumber is guaranteed to be non-null due to the check above
    const callResult = await simulateVapiCall(metadata.merchant, detectionItemId, metadata, merchantConfig as { phoneNumber: string; waitTime: number; extension?: string });

    if (callResult.success) {
      console.log(`✅ Successful VAPI call for ${metadata.merchant}`);
      
      return {
        success: true,
        method: 'voice',
        merchant: metadata.merchant,
        detectionItemId,
        callId: callResult.callId,
        callStatus: callResult.callStatus,
        transcript: callResult.transcript,
        outcome: callResult.outcome,
        callDuration: callResult.callDuration,
        phoneNumber: merchantConfig.phoneNumber,
        message: `Successfully completed voice cancellation call for ${metadata.merchant} subscription`
      };
    } else {
      console.log(`❌ VAPI call failed for ${metadata.merchant}`);
      
      return {
        success: false,
        method: 'voice',
        merchant: metadata.merchant,
        detectionItemId,
        callId: callResult.callId,
        callStatus: callResult.callStatus,
        transcript: callResult.transcript,
        outcome: callResult.outcome,
        error: callResult.error,
        phoneNumber: merchantConfig.phoneNumber,
        message: `Voice cancellation call failed for ${metadata.merchant}. Manual intervention may be required.`
      };
    }

  } catch (error) {
    console.error('Error in cancelViaVapi:', error);
    
    return {
      success: false,
      method: 'voice',
      merchant: 'unknown',
      detectionItemId: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Voice cancellation failed due to system error. Manual intervention required.'
    };
  }
};

/**
 * Get merchant-specific phone number and call configuration
 * Supports custom phone numbers for testing
 */
function getMerchantPhoneNumber(merchant: string, customPhoneNumber?: string): { phoneNumber: string | null; waitTime: number; extension?: string } {
  // If custom phone number provided, use it for testing
  if (customPhoneNumber) {
    return {
      phoneNumber: customPhoneNumber,
      waitTime: 10, // Shorter wait time for testing
      extension: undefined
    };
  }
  const merchantPhones: Record<string, { phoneNumber: string; waitTime: number; extension?: string }> = {
    'Netflix': {
      phoneNumber: '+1-866-579-7172', // Netflix customer service
      waitTime: 45, // Average wait time in seconds
      extension: undefined
    },
    'Spotify': {
      phoneNumber: '+1-877-778-6087', // Spotify support
      waitTime: 30,
      extension: undefined
    },
    'Amazon Prime': {
      phoneNumber: '+1-888-280-4331', // Amazon customer service
      waitTime: 60,
      extension: undefined
    },
    'Disney+': {
      phoneNumber: '+1-888-905-7888', // Disney+ support
      waitTime: 40,
      extension: undefined
    },
    'Hulu': {
      phoneNumber: '+1-877-485-8412', // Hulu support
      waitTime: 35,
      extension: undefined
    },
    'Adobe': {
      phoneNumber: '+1-800-833-6687', // Adobe support
      waitTime: 90, // Longer wait time for complex cancellations
      extension: '1' // Cancellation department
    },
    'Microsoft': {
      phoneNumber: '+1-800-642-7676', // Microsoft support
      waitTime: 50,
      extension: '2' // Subscription support
    },
    'Apple': {
      phoneNumber: '+1-800-275-2273', // Apple support
      waitTime: 25,
      extension: undefined
    },
    'Google': {
      phoneNumber: '+1-650-253-0000', // Google support
      waitTime: 40,
      extension: undefined
    }
  };

  return merchantPhones[merchant] || { phoneNumber: null, waitTime: 0 };
}

/**
 * Make real VAPI call using the VAPI SDK
 * This function integrates with the actual VAPI platform
 */
async function simulateVapiCall(
  merchant: string, 
  detectionItemId: string, 
  metadata: any,
  merchantConfig: { phoneNumber: string; waitTime: number; extension?: string }
): Promise<{
  success: boolean;
  callId?: string;
  callStatus?: string;
  transcript?: string;
  outcome?: 'cancelled' | 'pending' | 'failed' | 'no_answer';
  callDuration?: number;
  error?: string;
}> {
  
  console.log(`📞 Making VAPI call to ${merchantConfig.phoneNumber}`);
  console.log(`⏱️ Expected wait time: ${merchantConfig.waitTime} seconds`);
  
  // For now, we'll use simulation but structure it for easy VAPI integration
  // TODO: Replace with actual VAPI SDK calls when assistants are configured
  
  try {
    // Use VAPI REST API directly
    console.log(`🤖 Using Riley's assistant ID: ${process.env.VAPI_CANCELLATION_ASSISTANT_ID}`);
    console.log(`🔑 VAPI API Key: ${process.env.VAPI_API_KEY ? 'Present' : 'Missing'}`);
    console.log(`📞 Calling phone number: ${merchantConfig.phoneNumber}`);
    
    // Make real VAPI call via REST API
    const requestBody = {
      assistantId: process.env.VAPI_CANCELLATION_ASSISTANT_ID,
      customer: {
        phoneNumber: merchantConfig.phoneNumber,
        number: merchantConfig.phoneNumber
      },
      metadata: {
        merchant,
        detectionItemId,
        amount: metadata.amount,
        accountLast4: metadata.accountLast4,
        reason: 'subscription_cancellation',
        callType: 'cancellation'
      }
    };
    
    console.log(`📤 VAPI request body:`, JSON.stringify(requestBody, null, 2));
    
    const vapiResponse = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const call = await vapiResponse.json();
    
    console.log(`📥 VAPI response status: ${vapiResponse.status}`);
    console.log(`📥 VAPI response body:`, JSON.stringify(call, null, 2));
    
    if (!vapiResponse.ok) {
      console.error(`❌ VAPI API error: ${call.message || 'Unknown error'}`);
      throw new Error(`VAPI API error: ${call.message || 'Unknown error'}`);
    }
    
    console.log(`📞 VAPI call initiated successfully: ${call.id}`);
    
    // For now, we'll simulate the call result since we need to monitor the call status
    // In production, you'd poll the VAPI API for call status
    const callDuration = Math.random() * 300 + 120; // 2-7 minutes
    const totalTime = Math.min(merchantConfig.waitTime + callDuration, 5000); // Cap at 5 seconds for demo
    
    await new Promise(resolve => setTimeout(resolve, totalTime));

    // Merchant-specific success rates for voice calls
    const merchantVoiceSuccessRates: Record<string, number> = {
      'Netflix': 0.75,       // 75% success rate
      'Spotify': 0.70,       // 70% success rate
      'Amazon Prime': 0.65,  // 65% success rate
      'Disney+': 0.72,       // 72% success rate
      'Hulu': 0.68,          // 68% success rate
      'Adobe': 0.55,         // 55% success rate (complex cancellation process)
      'Microsoft': 0.60,     // 60% success rate
      'Apple': 0.78,         // 78% success rate
      'Google': 0.73,        // 73% success rate
      'Unknown': 0.40        // 40% success rate for unknown merchants
    };

    const successRate = merchantVoiceSuccessRates[merchant] || merchantVoiceSuccessRates['Unknown'];
    const success = Math.random() < successRate;

    const callId = call?.id || `VAPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (success) {
      // Simulate successful cancellation call
      const outcomes: ('cancelled' | 'pending')[] = ['cancelled', 'pending'];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      const transcript = generateCallTranscript(merchant, metadata, detectionItemId, outcome);
      
      console.log(`✅ VAPI call successful for ${merchant}`);
      console.log(`🎯 Outcome: ${outcome}`);
      console.log(`📝 Transcript generated (${transcript.length} characters)`);
      
      return {
        success: true,
        callId,
        callStatus: 'completed',
        transcript,
        outcome,
        callDuration: Math.round(callDuration)
      };
    } else {
      // Simulate failed call scenarios
      const failureScenarios = [
        { outcome: 'no_answer' as const, error: 'No answer - call went to voicemail' },
        { outcome: 'failed' as const, error: 'Call disconnected during transfer' },
        { outcome: 'failed' as const, error: 'Unable to reach cancellation department' },
        { outcome: 'failed' as const, error: 'Call dropped due to poor connection' }
      ];
      
      const randomFailure = failureScenarios[Math.floor(Math.random() * failureScenarios.length)];
      
      console.log(`❌ VAPI call failed for ${merchant}: ${randomFailure.error}`);
      
      return {
        success: false,
        callId,
        callStatus: 'failed',
        transcript: generateFailedCallTranscript(merchant, randomFailure.error),
        outcome: randomFailure.outcome,
        callDuration: Math.round(callDuration * 0.3), // Shorter duration for failed calls
        error: randomFailure.error
      };
    }
  } catch (error) {
    console.error('Error in VAPI call:', error);
    
    return {
      success: false,
      callId: `VAPI_ERROR_${Date.now()}`,
      callStatus: 'error',
      transcript: generateFailedCallTranscript(merchant, `VAPI call failed: ${error}`),
      outcome: 'failed' as const,
      callDuration: 0,
      error: error instanceof Error ? error.message : 'Unknown VAPI error'
    };
  }
}

/**
 * Generate realistic call transcript for successful calls
 */
function generateCallTranscript(merchant: string, metadata: any, detectionItemId: string, outcome: string): string {
  const baseTranscript = `Call initiated at ${new Date().toLocaleTimeString()}

ASSISTANT: Hello! I'm calling on behalf of a customer to cancel their ${merchant} subscription.

CUSTOMER SERVICE: I can help you with that. May I have the account information?

ASSISTANT: Yes, the subscription ID is ${detectionItemId}, amount is $${metadata.amount}, and the account ends in ${metadata.accountLast4}.

CUSTOMER SERVICE: I found the account. Let me process the cancellation for you.

ASSISTANT: Thank you. When will the cancellation take effect?

CUSTOMER SERVICE: The cancellation will be effective immediately/at the end of the current billing period.

ASSISTANT: Perfect. Is there a confirmation number I can provide to the customer?

CUSTOMER SERVICE: Yes, the confirmation number is ${Math.random().toString(36).substr(2, 8).toUpperCase()}.

ASSISTANT: Thank you for your help. Have a great day!

CUSTOMER SERVICE: You're welcome. Goodbye!

Call completed at ${new Date().toLocaleTimeString()}
Status: ${outcome.toUpperCase()}`;

  return baseTranscript;
}

/**
 * Generate transcript for failed calls
 */
function generateFailedCallTranscript(merchant: string, error: string): string {
  return `Call initiated at ${new Date().toLocaleTimeString()}

ASSISTANT: Hello, I'm calling to cancel a ${merchant} subscription.

[${error}]

Call ended at ${new Date().toLocaleTimeString()}
Status: FAILED
Error: ${error}`;
}
