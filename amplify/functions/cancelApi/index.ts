import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

/**
 * cancelApi Lambda Function
 * Stub implementation for demo purposes
 * Attempts to cancel subscriptions via merchant APIs
 */

interface CancelApiEvent {
  detectionItemId: string;
  userId: string;
  metadata: {
    merchant: string;
    amount: number;
    date: string;
    accountLast4: string;
  };
}

interface CancelApiResponse {
  success: boolean;
  method: string;
  merchant: string;
  detectionItemId: string;
  cancellationId?: string;
  error?: string;
  message?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<CancelApiResponse> => {
  console.log('cancelApi received event:', JSON.stringify(event, null, 2));

  try {
    const payload = event as unknown as CancelApiEvent;
    const { detectionItemId, userId, metadata } = payload;

    // Validate input
    if (!detectionItemId || !userId || !metadata?.merchant) {
      throw new Error('Missing required fields: detectionItemId, userId, or metadata.merchant');
    }

    console.log(`Attempting API cancellation for ${metadata.merchant} - ${detectionItemId}`);

    // Simulate API call to merchant's cancellation endpoint
    const success = await simulateMerchantApiCall(metadata.merchant, detectionItemId);

    if (success) {
      const cancellationId = `API_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`✅ Successful API cancellation for ${metadata.merchant}`);
      
      return {
        success: true,
        method: 'api',
        merchant: metadata.merchant,
        detectionItemId,
        cancellationId,
        message: `Successfully cancelled ${metadata.merchant} subscription via API`
      };
    } else {
      console.log(`❌ API cancellation failed for ${metadata.merchant}`);
      
      return {
        success: false,
        method: 'api',
        merchant: metadata.merchant,
        detectionItemId,
        error: 'Merchant API returned failure response',
        message: `API cancellation failed for ${metadata.merchant}. Will try email fallback.`
      };
    }

  } catch (error) {
    console.error('Error in cancelApi:', error);
    
    return {
      success: false,
      method: 'api',
      merchant: 'unknown',
      detectionItemId: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'API cancellation failed due to error. Will try email fallback.'
    };
  }
};

/**
 * Simulate API call to merchant's cancellation endpoint
 * In real implementation, this would make HTTP requests to actual merchant APIs
 */
async function simulateMerchantApiCall(merchant: string, detectionItemId: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

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
    'Unknown': 0.3 // Lower success rate for unknown merchants
  };

  const successRate = merchantSuccessRates[merchant] || merchantSuccessRates['Unknown'];
  const success = Math.random() < successRate;

  console.log(`Simulated API call to ${merchant}: ${success ? 'SUCCESS' : 'FAILED'} (${(successRate * 100).toFixed(1)}% success rate)`);

  // Log additional details for debugging
  if (success) {
    console.log(`✅ Merchant ${merchant} API returned success for detection ${detectionItemId}`);
  } else {
    console.log(`❌ Merchant ${merchant} API returned error for detection ${detectionItemId}`);
  }

  return success;
}
