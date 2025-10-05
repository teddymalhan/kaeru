// Test data for the ingestTransactions Lambda function
// Use this to manually test webhook processing

export const sampleWebhookPayloads = {
  syncUpdatesAvailable: {
    body: JSON.stringify({
      webhook_type: "TRANSACTIONS",
      webhook_code: "SYNC_UPDATES_AVAILABLE", 
      item_id: "test_item_123",
      initial_update_complete: true,
      historical_update_complete: false,
      environment: "sandbox"
    }),
    headers: {
      "content-type": "application/json",
      "plaid-verification": "test_signature" // In production, this would be a real HMAC signature
    },
    httpMethod: "POST",
    path: "/",
    queryStringParameters: null,
    isBase64Encoded: false,
    requestContext: {
      requestId: "test-request-id",
      stage: "test"
    }
  },

  initialUpdate: {
    body: JSON.stringify({
      webhook_type: "TRANSACTIONS", 
      webhook_code: "INITIAL_UPDATE",
      item_id: "test_item_123",
      error: null,
      new_transactions: 25,
      environment: "sandbox"
    }),
    headers: {
      "content-type": "application/json"
    },
    httpMethod: "POST",
    path: "/",
    queryStringParameters: null, 
    isBase64Encoded: false,
    requestContext: {
      requestId: "test-request-id",
      stage: "test"
    }
  },

  historicalUpdate: {
    body: JSON.stringify({
      webhook_type: "TRANSACTIONS",
      webhook_code: "HISTORICAL_UPDATE", 
      item_id: "test_item_123",
      error: null,
      new_transactions: 150,
      environment: "sandbox"
    }),
    headers: {
      "content-type": "application/json"
    },
    httpMethod: "POST",
    path: "/",
    queryStringParameters: null,
    isBase64Encoded: false,
    requestContext: {
      requestId: "test-request-id", 
      stage: "test"
    }
  }
};

export const testContext = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'ingestTransactions',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:ingestTransactions',
  memoryLimitInMB: '1024',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/ingestTransactions',
  logStreamName: '2023/10/04/[$LATEST]test123',
  getRemainingTimeInMillis: () => 300000,
  done: () => {},
  fail: () => {},
  succeed: () => {}
};

// Example usage:
// 
// import { handler } from './index.js';
// import { sampleWebhookPayloads, testContext } from './test-data.js';
//
// async function testWebhook() {
//   try {
//     const result = await handler(sampleWebhookPayloads.syncUpdatesAvailable, testContext);
//     console.log('Test result:', result);
//   } catch (error) {
//     console.error('Test error:', error);
//   }
// }
//
// testWebhook();