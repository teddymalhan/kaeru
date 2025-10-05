import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Configuration, PlaidApi, PlaidEnvironments, TransactionsSyncRequest } from 'plaid';
import crypto from 'crypto';

// Constants
const PLAID_TRANSACTION_SYNC_COUNT_MAX = 500;
const SQS_SEND_MESSAGE_BATCH_MAX = 10;

// Types for Plaid webhooks
interface PlaidWebhookBase {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  environment: 'sandbox' | 'production';
}

interface SyncUpdatesAvailableWebhook extends PlaidWebhookBase {
  webhook_code: 'SYNC_UPDATES_AVAILABLE';
  initial_update_complete: boolean;
  historical_update_complete: boolean;
}

interface TransactionMessage {
  DelaySeconds: number;
  Id: string;
  MessageAttributes: {
    ItemId: { StringValue: string; DataType: string };
    UserId: { StringValue: string; DataType: string };
    TransactionId: { StringValue: string; DataType: string };
    EventName: { StringValue: string; DataType: string };
  };
  MessageBody: string;
}

import { env } from '$amplify/env/ingestTransactions';

// Initialize clients
const createPlaidClient = () => {
  const clientId = env.PLAID_CLIENT_ID;
  const secret = env.PLAID_SANDBOX;
  const environment = env.PLAID_ENVIRONMENT || 'sandbox';

  if (!clientId || !secret) {
    throw new Error('Plaid credentials not configured. Please set PLAID_CLIENT_ID and PLAID_SANDBOX secrets.');
  }

  console.log(`Initializing Plaid client for environment: ${environment}`);

  const configuration = new Configuration({
    basePath: environment === 'production' ? PlaidEnvironments.production : PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
        'Plaid-Version': '2020-09-14',
      },
    },
  });

  return new PlaidApi(configuration);
};

// Utility functions
const generateId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

const nowISO8601 = (): string => {
  return new Date().toISOString();
};

// Database operations (simplified implementations)
async function getItemFromDB(userId: string, itemId: string): Promise<any> {
  console.log(`[STUB] Getting item from DB - User: ${userId}, Item: ${itemId}`);
  
  // For now, return a mock item structure
  // In production, this should connect to your DynamoDB table
  const mockItem = {
    access_token: process.env.TEST_ACCESS_TOKEN || null,
    cursor: undefined, // Start from beginning if no cursor stored
    item_id: itemId,
    user_id: userId,
    updated_at: nowISO8601()
  };

  if (!mockItem.access_token) {
    throw new Error(`No access token configured for item ${itemId}`);
  }

  return mockItem;
}

async function storeCursor(userId: string, itemId: string, cursor: string): Promise<void> {
  console.log(`[STUB] Storing cursor - User: ${userId}, Item: ${itemId}, Cursor: ${cursor}`);
  
  // In production, this should update your DynamoDB table
  // For now, just log the operation
  console.log(`Would store cursor ${cursor} for user ${userId}, item ${itemId} in DynamoDB`);
}

// Function to build SQS message for transaction
function buildTransactionMessage(userId: string, itemId: string, eventName: string, transaction: any): TransactionMessage {
  const transactionId = typeof transaction === 'string' ? transaction : transaction.transaction_id;

  const message: TransactionMessage = {
    DelaySeconds: 0,
    Id: generateId(),
    MessageAttributes: {
      ItemId: {
        StringValue: itemId,
        DataType: 'String'
      },
      UserId: {
        StringValue: userId,
        DataType: 'String'
      },
      TransactionId: {
        StringValue: transactionId,
        DataType: 'String'
      },
      EventName: {
        StringValue: eventName,
        DataType: 'String'
      }
    },
    MessageBody: JSON.stringify({
      pk: `USER#${userId}#ITEM#${itemId}`,
      sk: `TRANSACTION#${transactionId}`,
      ...(eventName !== 'REMOVE' && typeof transaction === 'object' ? {
        ...transaction,
        gsi1pk: `USER#${userId}#ITEM#${itemId}#TRANSACTIONS`,
        gsi1sk: `TRANSACTION#${transaction.date}#${transactionId}`
      } : {})
    })
  };

  return message;
}

// Function to send messages to SQS in batches (simplified implementation)
async function sendMessages(messages: TransactionMessage[]): Promise<void> {
  const queueUrl = process.env.SQS_QUEUE_URL;
  if (!queueUrl) {
    console.log('No SQS queue configured, logging messages instead');
    
    // Log the messages that would be sent
    messages.forEach((message, index) => {
      console.log(`[STUB] Would send message ${index + 1}:`, {
        id: message.Id,
        attributes: message.MessageAttributes,
        bodyPreview: message.MessageBody.substring(0, 200) + '...'
      });
    });
    return;
  }

  console.log(`[STUB] Would send ${messages.length} messages to SQS queue: ${queueUrl}`);
  
  // In production, this would use the SQS SDK to send messages
  // For now, just log what would be sent
  for (let i = 0; i < messages.length; i += SQS_SEND_MESSAGE_BATCH_MAX) {
    const batch = messages.slice(i, i + SQS_SEND_MESSAGE_BATCH_MAX);
    console.log(`[STUB] Would send batch of ${batch.length} messages to SQS`);
  }
}

// Function to sync transactions for a given access token
async function syncTransactions(plaidClient: PlaidApi, userId: string, itemId: string, accessToken: string, cursor?: string): Promise<void> {
  console.log(`Starting transaction sync for item: ${itemId}`);
  
  let added: any[] = [];
  let modified: any[] = [];
  let removed: any[] = [];
  let hasMore = true;
  let currentCursor = cursor;

  try {
    // Iterate through each page of new transaction updates
    while (hasMore) {
      const request: TransactionsSyncRequest = {
        access_token: accessToken,
        count: PLAID_TRANSACTION_SYNC_COUNT_MAX,
        options: {
          include_personal_finance_category: true
        },
        ...(currentCursor && { cursor: currentCursor })
      };

      console.log(`Calling /transactions/sync with cursor: ${currentCursor || 'null'}`);
      const response = await plaidClient.transactionsSync(request);
      const data = response.data;

      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      
      hasMore = data.has_more;
      currentCursor = data.next_cursor;

      console.log(`Page results - Added: ${data.added.length}, Modified: ${data.modified.length}, Removed: ${data.removed.length}`);
    }

    // Build messages for SQS
    const addedMessages = added.map(transaction => buildTransactionMessage(userId, itemId, 'INSERT', transaction));
    const modifiedMessages = modified.map(transaction => buildTransactionMessage(userId, itemId, 'MODIFY', transaction));
    const removedMessages = removed.map(transactionId => buildTransactionMessage(userId, itemId, 'REMOVE', transactionId));

    const allMessages = [...addedMessages, ...modifiedMessages, ...removedMessages];
    
    if (allMessages.length > 0) {
      await sendMessages(allMessages);
    }

    // Store the cursor
    if (currentCursor) {
      await storeCursor(userId, itemId, currentCursor);
    }

    console.log(`Transaction sync completed. Total - Added: ${added.length}, Modified: ${modified.length}, Removed: ${removed.length}`);

  } catch (error: any) {
    console.error('Error syncing transactions:', error);
    
    if (error.response?.data) {
      const plaidError = error.response.data;
      console.error('Plaid API Error:', {
        error_type: plaidError.error_type,
        error_code: plaidError.error_code,
        error_message: plaidError.error_message,
        display_message: plaidError.display_message,
        documentation_url: plaidError.documentation_url,
        suggested_action: plaidError.suggested_action,
      });

      // Handle specific error types
      switch (plaidError.error_type) {
        case 'ITEM_ERROR':
          console.error('Item-related error - may need user intervention or re-authentication');
          break;
        case 'RATE_LIMIT_EXCEEDED':
          console.error('Rate limit exceeded - will retry later');
          break;
        case 'API_ERROR':
          console.error('Plaid API error - may be temporary');
          break;
        case 'INVALID_REQUEST':
          console.error('Invalid request - check parameters');
          break;
        default:
          console.error(`Unhandled error type: ${plaidError.error_type}`);
      }
    }
    
    throw error;
  }
}

// Function to validate Plaid webhook with signature verification
function validateWebhook(event: APIGatewayProxyEvent): boolean {
  const body = event.body;
  if (!body) {
    console.error('No request body found');
    return false;
  }

  // Implement webhook signature verification for production
  const webhookSecret = process.env.PLAID_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = event.headers['plaid-verification'] || event.headers['Plaid-Verification'];
    if (!signature) {
      console.error('Missing Plaid-Verification header');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return false;
    }
  } else {
    console.warn('PLAID_WEBHOOK_SECRET not set - webhook signature validation disabled');
  }

  // Basic format validation
  try {
    const webhook = JSON.parse(body);
    if (!webhook.webhook_type || !webhook.webhook_code || !webhook.item_id) {
      console.error('Missing required webhook fields');
      return false;
    }
  } catch (error) {
    console.error('Invalid JSON in webhook body:', error);
    return false;
  }

  return true;
}

// Function to get user ID by item ID
async function getUserIdByItem(itemId: string): Promise<string | null> {
  const tableName = process.env.DYNAMODB_TABLE_NAME;
  if (!tableName) {
    throw new Error('DYNAMODB_TABLE_NAME environment variable not set');
  }

  // This is a placeholder implementation. You need to adapt this based on your DynamoDB schema
  // If you have a GSI with ITEM#{itemId} as the partition key, you can query it
  // For now, we'll assume you have a way to look up the user by item
  
  console.log(`Looking up user for item_id: ${itemId}`);
  
  // TODO: Implement based on your actual DynamoDB schema
  // Example if you have a GSI:
  // const params = {
  //   TableName: tableName,
  //   IndexName: 'ItemIndex', // Your GSI name
  //   KeyConditionExpression: 'gsi_pk = :itemId',
  //   ExpressionAttributeValues: marshall({
  //     ':itemId': `ITEM#${itemId}`
  //   }),
  //   Limit: 1,
  //   ProjectionExpression: 'pk',
  //   Select: 'SPECIFIC_ATTRIBUTES' as const
  // };

  // For now, return null to indicate that user lookup needs to be implemented
  // based on your specific schema
  return null;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log('IngestTransactions Lambda triggered');
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Validate the webhook
    if (!validateWebhook(event)) {
      console.error('Invalid webhook format');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid webhook format' }),
      };
    }

    const webhook = JSON.parse(event.body!) as PlaidWebhookBase;
    console.log(`Received webhook: ${webhook.webhook_type} - ${webhook.webhook_code}`);

    // Handle different webhook types
    switch (webhook.webhook_code) {
      case 'SYNC_UPDATES_AVAILABLE': {
        const syncWebhook = webhook as SyncUpdatesAvailableWebhook;
        console.log(`SYNC_UPDATES_AVAILABLE webhook for item: ${syncWebhook.item_id}`);
        console.log(`Initial update complete: ${syncWebhook.initial_update_complete}`);
        console.log(`Historical update complete: ${syncWebhook.historical_update_complete}`);

        // For now, we'll use a temporary implementation for testing
        // In production, you need to implement proper user lookup and database integration
        
        let userId = 'temp-user';
        let accessToken = process.env.TEST_ACCESS_TOKEN; // Set this for testing
        let lastCursor: string | undefined = undefined;

        // Try to get user and item data from database if environment is configured
        if (process.env.DYNAMODB_TABLE_NAME) {
          try {
            userId = await getUserIdByItem(syncWebhook.item_id) || 'temp-user';
            
            if (userId !== 'temp-user') {
              const itemData = await getItemFromDB(userId, syncWebhook.item_id);
              accessToken = itemData.access_token;
              lastCursor = itemData.cursor;
            }
          } catch (error) {
            console.warn(`Database lookup failed, using fallback: ${error}`);
            // Continue with temp values for testing
          }
        }

        if (!accessToken) {
          console.error(`No access token configured. Set TEST_ACCESS_TOKEN environment variable for testing or implement database integration.`);
          return {
            statusCode: 404,
            body: JSON.stringify({ 
              error: 'Access token not configured',
              item_id: syncWebhook.item_id,
              message: 'Set TEST_ACCESS_TOKEN environment variable or implement database integration'
            }),
          };
        }

        // Initialize Plaid client and sync transactions
        const plaidClient = createPlaidClient();
        
        await syncTransactions(plaidClient, userId, syncWebhook.item_id, accessToken, lastCursor);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Transactions synced successfully',
            item_id: syncWebhook.item_id
          }),
        };
      }

      case 'INITIAL_UPDATE':
        console.log('INITIAL_UPDATE webhook received - 30 days of data available');
        // Handle initial update if needed
        break;

      case 'HISTORICAL_UPDATE':
        console.log('HISTORICAL_UPDATE webhook received - full history available');
        // Handle historical update if needed
        break;

      case 'DEFAULT_UPDATE':
        console.log('DEFAULT_UPDATE webhook received - new transactions available');
        // This is the older webhook, SYNC_UPDATES_AVAILABLE is preferred
        break;

      case 'TRANSACTIONS_REMOVED':
        console.log('TRANSACTIONS_REMOVED webhook received');
        // Handle removed transactions if needed
        break;

      default:
        console.log(`Unhandled webhook code: ${webhook.webhook_code}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook processed successfully' }),
    };

  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
    };
  }
};