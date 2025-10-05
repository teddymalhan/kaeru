# Ingest Transactions Lambda Function

This Lambda function processes Plaid webhooks to sync transaction data from users' bank accounts.

## Overview

The function handles Plaid webhooks, particularly the `SYNC_UPDATES_AVAILABLE` webhook, and uses the `/transactions/sync` endpoint to fetch updated transaction data from Plaid's API.

## Features

- ✅ **Webhook Processing**: Handles Plaid webhook notifications
- ✅ **Transaction Sync**: Uses Plaid's recommended `/transactions/sync` endpoint
- ✅ **Error Handling**: Comprehensive error handling with logging
- ✅ **Security**: Webhook signature validation (ready for production)
- ✅ **Scalability**: Handles large transaction datasets with pagination

## Environment Variables

The following environment variables need to be set:

```bash
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENVIRONMENT=sandbox  # or 'production'
PLAID_WEBHOOK_SECRET=your_webhook_secret  # For signature validation
```

## Webhook Configuration

### 1. Get the Function URL

After deploying, you'll get a Function URL that looks like:

```
https://[unique-id].lambda-url.[region].on.aws/
```

### 2. Configure Plaid Webhook

In the Plaid Dashboard:

1. Go to Account -> Team Settings -> Webhooks
2. Add a new webhook endpoint with your Function URL
3. Select the webhook types you want to receive:
   - ✅ **SYNC_UPDATES_AVAILABLE** (recommended)
   - ✅ **INITIAL_UPDATE** (optional)
   - ✅ **HISTORICAL_UPDATE** (optional)

### 3. Link Token Creation

When creating Link tokens, include the webhook URL:

```typescript
const response = await plaidClient.linkTokenCreate({
  user: { client_user_id: userId },
  client_name: "Cancel My Stuff",
  products: ["transactions"],
  webhook: "https://your-function-url.lambda-url.us-east-1.on.aws/",
  country_codes: ["US"],
  language: "en",
});
```

## Webhook Flow

1. **User Links Account**: User connects their bank account via Plaid Link
2. **Initial Sync**: Plaid processes initial transaction data
3. **Webhook Triggered**: Plaid sends `SYNC_UPDATES_AVAILABLE` webhook
4. **Function Processes**: Lambda function receives webhook and:
   - Validates the webhook format/signature
   - Looks up the access token for the item_id
   - Calls `/transactions/sync` to get updates
   - Saves transaction data to your database

## Database Integration

The function includes placeholder methods that you need to implement:

### `getAccessTokenForItem(itemId: string)`

Retrieves the access token for a given Plaid item_id from your database.

```typescript
async function getAccessTokenForItem(itemId: string): Promise<string | null> {
  // TODO: Implement database lookup
  // Example with Amplify DataStore:
  // const item = await DataStore.query(PlaidItem, itemId);
  // return item?.accessToken || null;

  return null;
}
```

### `saveTransactionData(itemId: string, transactionData: any, cursor: string)`

Saves the synced transaction data to your database.

```typescript
async function saveTransactionData(
  itemId: string,
  transactionData: any,
  cursor: string
) {
  // TODO: Implement database storage
  // Example with Amplify DataStore:
  //
  // // Save new transactions
  // for (const transaction of transactionData.added) {
  //   await DataStore.save(new Transaction({
  //     plaidTransactionId: transaction.transaction_id,
  //     amount: transaction.amount,
  //     date: transaction.date,
  //     description: transaction.name,
  //     // ... other fields
  //   }));
  // }
  //
  // // Update modified transactions
  // for (const transaction of transactionData.modified) {
  //   const existing = await DataStore.query(Transaction, t =>
  //     t.plaidTransactionId.eq(transaction.transaction_id)
  //   );
  //   if (existing.length > 0) {
  //     await DataStore.save(Transaction.copyOf(existing[0], updated => {
  //       updated.amount = transaction.amount;
  //       updated.description = transaction.name;
  //       // ... other fields
  //     }));
  //   }
  // }
  //
  // // Remove deleted transactions
  // for (const removedTx of transactionData.removed) {
  //   const existing = await DataStore.query(Transaction, t =>
  //     t.plaidTransactionId.eq(removedTx.transaction_id)
  //   );
  //   if (existing.length > 0) {
  //     await DataStore.delete(existing[0]);
  //   }
  // }
  //
  // // Update cursor for next sync
  // await DataStore.save(new PlaidItem({
  //   itemId: itemId,
  //   syncCursor: cursor,
  //   lastSyncAt: new Date().toISOString(),
  // }));
}
```

## Testing

### 1. Sandbox Testing

Use Plaid's sandbox environment to test the webhook:

```bash
# Set environment to sandbox
export PLAID_ENVIRONMENT=sandbox
export PLAID_CLIENT_ID=your_sandbox_client_id
export PLAID_SECRET=your_sandbox_secret
```

### 2. Simulate Webhooks

Use Plaid's sandbox tools to simulate transaction updates:

```typescript
// Force a refresh to trigger webhooks
await plaidClient.transactionsRefresh({
  access_token: accessToken,
});
```

### 3. Manual Testing

You can manually invoke the Lambda with a test webhook payload:

```json
{
  "body": "{\"webhook_type\":\"TRANSACTIONS\",\"webhook_code\":\"SYNC_UPDATES_AVAILABLE\",\"item_id\":\"test_item_id\",\"initial_update_complete\":true,\"historical_update_complete\":false,\"environment\":\"sandbox\"}",
  "headers": {
    "content-type": "application/json"
  },
  "httpMethod": "POST"
}
```

## Monitoring & Logs

The function includes comprehensive logging:

- Webhook validation results
- Transaction sync progress
- Error details with Plaid error codes
- Performance metrics (transactions processed)

Monitor CloudWatch logs to track:

- Webhook processing success/failures
- Transaction sync performance
- Error patterns

## Security Considerations

1. **Webhook Validation**: Uncomment the signature validation code for production
2. **Environment Variables**: Store secrets in AWS Secrets Manager for production
3. **Network Security**: Consider VPC configuration if database is in private subnets
4. **Rate Limiting**: Monitor and implement rate limiting if needed

## Production Checklist

- [ ] Enable webhook signature validation
- [ ] Move secrets to AWS Secrets Manager
- [ ] Implement database storage methods
- [ ] Set up monitoring and alerting
- [ ] Configure proper IAM roles and permissions
- [ ] Test with production Plaid environment
- [ ] Set up error notification (SNS/email)

## Common Issues

### 1. "Access token not found"

- Ensure you're storing access tokens when users link accounts
- Check that item_id in webhook matches your database records

### 2. "Invalid webhook format"

- Verify webhook URL is correctly configured in Plaid Dashboard
- Check that webhook signature validation is not blocking valid webhooks

### 3. "Plaid API errors"

- Check environment configuration (sandbox vs production)
- Verify API credentials are correct and active
- Review Plaid error codes in logs

## Next Steps

1. Implement the database integration methods
2. Test with sandbox data
3. Deploy and configure webhook URL in Plaid Dashboard
4. Monitor initial webhook processing
5. Scale to production environment
