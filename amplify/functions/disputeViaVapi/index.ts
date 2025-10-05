import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * disputeViaVapi Lambda Function
 * Uses VAPI to make voice calls to bank/credit card dispute lines
 * Handles transaction disputes through automated voice interactions
 */

interface DisputeViaVapiEvent {
  detectionItemId: string;
  userId: string;
  metadata: {
    merchant: string;
    amount: number;
    date: string;
    accountLast4: string;
    disputeReason?: string;
    customPhoneNumber?: string;
    testPhoneNumber?: string;
  };
  action?: string; // 'initiate_call' or 'verify_call'
  callId?: string; // For verification calls
}

interface DisputeViaVapiResponse {
  success: boolean;
  method: string;
  merchant: string;
  detectionItemId: string;
  callId?: string;
  callStatus?: string;
  transcript?: string;
  disputeSubmitted?: boolean;
  caseId?: string;
  disputeStatus?: 'initiated' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  message?: string;
  callDuration?: number;
  bankName?: string;
  phoneNumber?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<DisputeViaVapiResponse> => {
  console.log('disputeViaVapi received event:', JSON.stringify(event, null, 2));

  try {
    const payload = event as unknown as DisputeViaVapiEvent;
    const { detectionItemId, userId, metadata, action, callId } = payload;

    // Validate input
    if (!detectionItemId || !userId || !metadata?.merchant) {
      throw new Error('Missing required fields: detectionItemId, userId, or metadata.merchant');
    }

    // Handle different actions
    if (action === 'verify_call' && callId) {
      console.log(`🔍 Verifying call status for call ID: ${callId}`);
      return await verifyDisputeCall(callId, detectionItemId, userId);
    }

    // Default action: initiate dispute call
    console.log(`🤖 Initiating VAPI dispute call for ${metadata.merchant} - ${detectionItemId}`);
    console.log(`💳 Dispute reason: ${metadata.disputeReason || 'fraud'}`);

          // Determine bank/credit card provider from account
          // Support custom phone number for testing (e.g., user's own phone)
          const customPhoneNumber = metadata.customPhoneNumber || metadata.testPhoneNumber;
          const bankConfig = getBankPhoneNumber(metadata.accountLast4, metadata.merchant, customPhoneNumber);

          // Ensure we have a valid phone number
          if (!bankConfig.phoneNumber) {
            console.log(`❌ No dispute phone number available for account ending in ${metadata.accountLast4}`);
            return {
              success: false,
              method: 'voice',
              merchant: metadata.merchant,
              detectionItemId,
              error: `No dispute phone number available for account ending in ${metadata.accountLast4}`,
              message: `Dispute call failed: Unable to determine bank for account ending in ${metadata.accountLast4}`
            };
          }

    // Simulate VAPI call (replace with actual VAPI SDK implementation)
    // At this point, bankConfig.phoneNumber is guaranteed to be non-null due to the check above
    const callResult = await simulateDisputeCall(metadata, detectionItemId, bankConfig as { phoneNumber: string; bankName: string; waitTime: number; extension?: string });

    if (callResult.success) {
      console.log(`✅ Successful dispute call for ${metadata.merchant}`);
      
      return {
        success: true,
        method: 'voice',
        merchant: metadata.merchant,
        detectionItemId,
        callId: callResult.callId,
        callStatus: callResult.callStatus,
        transcript: callResult.transcript,
        disputeSubmitted: callResult.disputeSubmitted,
        caseId: callResult.caseId,
        disputeStatus: callResult.disputeStatus,
        callDuration: callResult.callDuration,
        bankName: bankConfig.bankName,
        phoneNumber: bankConfig.phoneNumber,
        message: `Successfully initiated dispute for ${metadata.merchant} transaction`
      };
    } else {
      console.log(`❌ Dispute call failed for ${metadata.merchant}`);
      
      return {
        success: false,
        method: 'voice',
        merchant: metadata.merchant,
        detectionItemId,
        callId: callResult.callId,
        callStatus: callResult.callStatus,
        transcript: callResult.transcript,
        disputeSubmitted: false,
        disputeStatus: 'failed',
        error: callResult.error,
        bankName: bankConfig.bankName,
        phoneNumber: bankConfig.phoneNumber,
        message: `Dispute call failed for ${metadata.merchant}. Manual intervention may be required.`
      };
    }

  } catch (error) {
    console.error('Error in disputeViaVapi:', error);
    
    return {
      success: false,
      method: 'voice',
      merchant: 'unknown',
      detectionItemId: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Dispute call failed due to system error. Manual intervention required.'
    };
  }
};

/**
 * Verify the status of a dispute call
 */
async function verifyDisputeCall(callId: string, detectionItemId: string, userId: string): Promise<DisputeViaVapiResponse> {
  console.log(`🔍 Verifying dispute call: ${callId}`);
  
  // Simulate call verification (in production, this would query VAPI API)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate different verification outcomes
  const outcomes = [
    {
      disputeSubmitted: true,
      caseId: `CASE_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      disputeStatus: 'completed' as const,
      callStatus: 'completed'
    },
    {
      disputeSubmitted: false,
      caseId: null,
      disputeStatus: 'failed' as const,
      callStatus: 'failed'
    }
  ];
  
  const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
  
  return {
    success: outcome.disputeSubmitted,
    method: 'voice',
    merchant: 'unknown',
    detectionItemId,
    callId,
    callStatus: outcome.callStatus,
    disputeSubmitted: outcome.disputeSubmitted,
    caseId: outcome.caseId || undefined,
    disputeStatus: outcome.disputeStatus,
    message: outcome.disputeSubmitted 
      ? `Dispute successfully submitted. Case ID: ${outcome.caseId}`
      : 'Dispute verification failed'
  };
}

/**
 * Get bank phone number based on account last 4 digits and merchant
 * This is a simplified mapping - in production, you'd use a more sophisticated lookup
 * Supports custom phone numbers for testing
 */
function getBankPhoneNumber(accountLast4: string, merchant: string, customPhoneNumber?: string): { 
  phoneNumber: string | null; 
  bankName: string; 
  waitTime: number; 
  extension?: string 
} {
  // If custom phone number provided, use it for testing
  if (customPhoneNumber) {
    return {
      phoneNumber: customPhoneNumber,
      bankName: 'Test Bank',
      waitTime: 10, // Shorter wait time for testing
      extension: undefined
    };
  }
  // Simplified bank detection based on account patterns
  // In production, you'd use a more sophisticated bank identification system
  const bankMappings: Record<string, { phoneNumber: string; bankName: string; waitTime: number; extension?: string }> = {
    // Common bank dispute numbers (these are examples - verify actual numbers)
    'chase': {
      phoneNumber: '+1-800-935-9935', // Chase dispute line
      bankName: 'Chase Bank',
      waitTime: 45,
      extension: '2' // Dispute department
    },
    'bankofamerica': {
      phoneNumber: '+1-800-732-9194', // Bank of America dispute line
      bankName: 'Bank of America',
      waitTime: 50,
      extension: '3' // Fraud/dispute department
    },
    'wells': {
      phoneNumber: '+1-800-869-3557', // Wells Fargo dispute line
      bankName: 'Wells Fargo',
      waitTime: 40,
      extension: '1' // Report fraud
    },
    'citi': {
      phoneNumber: '+1-800-950-5114', // Citibank dispute line
      bankName: 'Citibank',
      waitTime: 35,
      extension: '2' // Dispute department
    },
    'amex': {
      phoneNumber: '+1-800-528-4800', // American Express dispute line
      bankName: 'American Express',
      waitTime: 30,
      extension: undefined
    },
    'discover': {
      phoneNumber: '+1-800-347-2683', // Discover dispute line
      bankName: 'Discover',
      waitTime: 25,
      extension: '2' // Dispute department
    }
  };

  // For demo purposes, randomly assign a bank based on account pattern
  // In production, you'd use actual bank identification logic
  const bankKeys = Object.keys(bankMappings);
  const randomBank = bankKeys[Math.floor(Math.random() * bankKeys.length)];
  
  return bankMappings[randomBank] || { phoneNumber: null, bankName: 'Unknown Bank', waitTime: 0 };
}

/**
 * Simulate VAPI dispute call (replace with actual VAPI SDK implementation)
 */
async function simulateDisputeCall(
  metadata: any,
  detectionItemId: string,
  bankConfig: { phoneNumber: string; bankName: string; waitTime: number; extension?: string }
): Promise<{
  success: boolean;
  callId?: string;
  callStatus?: string;
  transcript?: string;
  disputeSubmitted?: boolean;
  caseId?: string;
  disputeStatus?: 'initiated' | 'in_progress' | 'completed' | 'failed';
  callDuration?: number;
  error?: string;
}> {
  
  console.log(`📞 Making VAPI dispute call to ${bankConfig.bankName} (${bankConfig.phoneNumber})`);
  console.log(`⏱️ Expected wait time: ${bankConfig.waitTime} seconds`);
  
  // Use VAPI REST API directly
  console.log(`🤖 Using Riley's assistant ID: ${process.env.VAPI_DISPUTE_ASSISTANT_ID}`);
  
  // Make real VAPI call via REST API
  const vapiResponse = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      assistantId: process.env.VAPI_DISPUTE_ASSISTANT_ID,
      customer: {
        phoneNumber: bankConfig.phoneNumber,
        number: bankConfig.phoneNumber
      },
      metadata: {
        merchant: metadata.merchant,
        detectionItemId,
        amount: metadata.amount,
        accountLast4: metadata.accountLast4,
        disputeReason: metadata.disputeReason || 'fraud',
        callType: 'dispute',
        bankName: bankConfig.bankName
      }
    })
  });
  
  const call = await vapiResponse.json();
  
  if (!vapiResponse.ok) {
    throw new Error(`VAPI API error: ${call.message || 'Unknown error'}`);
  }
  
  console.log(`📞 VAPI dispute call initiated: ${call.id}`);
  
  // For now, we'll simulate the call result since we need to monitor the call status
  // In production, you'd poll the VAPI API for call status
  const callDuration = Math.random() * 600 + 180; // 3-13 minutes (disputes take longer)
  const totalTime = Math.min(bankConfig.waitTime + callDuration, 8000); // Cap at 8 seconds for demo
  
  await new Promise(resolve => setTimeout(resolve, totalTime));

  // Bank-specific success rates for dispute calls
  const bankSuccessRates: Record<string, number> = {
    'Chase Bank': 0.80,
    'Bank of America': 0.75,
    'Wells Fargo': 0.78,
    'Citibank': 0.72,
    'American Express': 0.85,
    'Discover': 0.77,
    'Unknown Bank': 0.60
  };

  const successRate = bankSuccessRates[bankConfig.bankName] || bankSuccessRates['Unknown Bank'];
  const success = Math.random() < successRate;

  const callId = call?.id || `DISPUTE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  if (success) {
    // Simulate successful dispute call
    const caseId = `CASE_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const transcript = generateDisputeTranscript(metadata, detectionItemId, bankConfig.bankName, caseId);
    
    console.log(`✅ Dispute call successful for ${bankConfig.bankName}`);
    console.log(`📋 Case ID: ${caseId}`);
    console.log(`📝 Transcript generated (${transcript.length} characters)`);
    
    return {
      success: true,
      callId,
      callStatus: 'completed',
      transcript,
      disputeSubmitted: true,
      caseId,
      disputeStatus: 'completed',
      callDuration: Math.round(callDuration)
    };
  } else {
    // Simulate failed dispute call scenarios
    const failureScenarios = [
      { error: 'Unable to reach dispute department', status: 'failed' as const },
      { error: 'Call dropped during verification', status: 'failed' as const },
      { error: 'Insufficient account information', status: 'failed' as const },
      { error: 'System temporarily unavailable', status: 'failed' as const }
    ];
    
    const randomFailure = failureScenarios[Math.floor(Math.random() * failureScenarios.length)];
    
    console.log(`❌ Dispute call failed for ${bankConfig.bankName}: ${randomFailure.error}`);
    
    return {
      success: false,
      callId,
      callStatus: 'failed',
      transcript: generateFailedDisputeTranscript(metadata, bankConfig.bankName, randomFailure.error),
      disputeSubmitted: false,
      disputeStatus: randomFailure.status,
      callDuration: Math.round(callDuration * 0.4), // Shorter duration for failed calls
      error: randomFailure.error
    };
  }
}

/**
 * Generate realistic dispute call transcript
 */
function generateDisputeTranscript(metadata: any, detectionItemId: string, bankName: string, caseId: string): string {
  const baseTranscript = `Dispute Call initiated at ${new Date().toLocaleTimeString()}

ASSISTANT: Hello, I'm calling to report a disputed transaction on behalf of a customer.

BANK REPRESENTATIVE: I can help you with that. What are the transaction details?

ASSISTANT: The transaction is for ${metadata.merchant}, amount $${metadata.amount}, date ${metadata.date}, and the account ends in ${metadata.accountLast4}.

BANK REPRESENTATIVE: I found the transaction. What is the reason for the dispute?

ASSISTANT: The customer is disputing this charge as ${metadata.disputeReason || 'fraud'}. The reference ID is ${detectionItemId}.

BANK REPRESENTATIVE: I understand. Let me process this dispute for you.

[Processing time...]

BANK REPRESENTATIVE: I've successfully submitted the dispute. Your case number is ${caseId}.

ASSISTANT: Thank you. What happens next?

BANK REPRESENTATIVE: The dispute will be investigated within 10-15 business days. You'll receive written confirmation.

ASSISTANT: Perfect. Is there anything else needed from the customer?

BANK REPRESENTATIVE: No, that covers everything. The dispute is now in progress.

ASSISTANT: Thank you for your help. Have a good day!

BANK REPRESENTATIVE: You're welcome. Goodbye!

Call completed at ${new Date().toLocaleTimeString()}
Status: DISPUTE SUBMITTED
Case ID: ${caseId}
Bank: ${bankName}`;

  return baseTranscript;
}

/**
 * Generate transcript for failed dispute calls
 */
function generateFailedDisputeTranscript(metadata: any, bankName: string, error: string): string {
  return `Dispute Call initiated at ${new Date().toLocaleTimeString()}

ASSISTANT: Hello, I'm calling to report a disputed transaction.

BANK REPRESENTATIVE: I can help you with that. Let me get the transaction details.

[${error}]

Call ended at ${new Date().toLocaleTimeString()}
Status: FAILED
Error: ${error}
Bank: ${bankName}`;
}
