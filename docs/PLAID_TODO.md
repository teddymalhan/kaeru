// TODO Checklist for Plaid Transactions Integration

## ✅ Completed

- [x] Added webhook URL to Plaid dashboard
- [x] Set up PLAID_CLIENT_ID and PLAID_SANDBOX secrets
- [x] Created ingestTransactions Lambda function
- [x] Configured Function URL for webhook receiving
- [x] Basic webhook validation and processing logic

## 🔄 In Progress / Next Steps

### 1. Security & Configuration

- [ ] Set PLAID_WEBHOOK_SECRET for signature verification
- [ ] Uncomment webhook signature validation in code
- [ ] Test webhook signature validation

### 2. Link Token Creation

- [ ] Implement Link token creation API that includes webhook URL
- [ ] Ensure all Link tokens include your webhook URL:
      `https://qxqc52wktm74c2fod3trdrhzaq0ztpym.lambda-url.us-east-1.on.aws/`

### 3. Database Integration

- [ ] Implement `getItemFromDB()` to retrieve access tokens and cursors
- [ ] Implement `storeCursor()` to save sync progression
- [ ] Implement `getUserIdByItem()` to map Plaid items to users
- [ ] Set up DynamoDB table schema for: - User access tokens  
       - Transaction sync cursors - Transaction data

### 4. Transaction Processing

- [ ] Set up SQS queue for transaction processing (OR)
- [ ] Implement direct transaction storage in database
- [ ] Process transaction events (INSERT, MODIFY, REMOVE)

### 5. Initial Sync Setup

- [ ] Call `/transactions/sync` after successful Link connection
- [ ] Handle initial transaction backfill (30+ days)
- [ ] Store initial cursor for ongoing sync

### 6. Error Handling & Monitoring

- [ ] Set up CloudWatch alerts for webhook failures
- [ ] Implement retry logic for failed syncs
- [ ] Add proper error logging and metrics

### 7. Testing

- [ ] Test webhook with Plaid's webhook testing tool
- [ ] Test Link flow end-to-end
- [ ] Verify transaction sync is working
- [ ] Test error scenarios (expired tokens, etc.)

## 📋 Commands to Run

```bash
# Set webhook secret (for signature verification)
npx ampx sandbox secret set PLAID_WEBHOOK_SECRET

# Test webhook endpoint
curl -X POST https://qxqc52wktm74c2fod3trdrhzaq0ztpym.lambda-url.us-east-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{"webhook_type":"TRANSACTIONS","webhook_code":"SYNC_UPDATES_AVAILABLE","item_id":"test_item"}'

# Check function logs
npx ampx sandbox logs --function ingestTransactions
```

## 🚨 Critical Points

1. **Must include webhook URL in Link token creation** - This is how Plaid knows where to send updates
2. **Call /transactions/sync at least once after Link** - Webhooks won't fire until initial sync
3. **Store access tokens securely** - Needed for ongoing transaction sync
4. **Implement cursor storage** - Required for incremental sync progression

## 📚 References

- Plaid Transactions Webhooks: https://plaid.com/docs/transactions/webhooks/
- /transactions/sync API: https://plaid.com/docs/api/products/transactions/#transactionssync
- Link token webhook config: https://plaid.com/docs/api/tokens/#linktokencreate
